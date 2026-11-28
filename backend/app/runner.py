import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
import yaml
import docker

CHALLENGES_DIR = Path(__file__).resolve().parent.parent / "challenges"


_DOCKER_CLIENT_CACHE = "UNCHECKED"


def get_docker_client():
    """Lazily and safely initializes the Docker client if available."""
    global _DOCKER_CLIENT_CACHE
    if _DOCKER_CLIENT_CACHE != "UNCHECKED":
        return _DOCKER_CLIENT_CACHE if _DOCKER_CLIENT_CACHE is not None else None

    try:
        import docker
        client = docker.from_env(timeout=1)
        client.ping()
        _DOCKER_CLIENT_CACHE = client
        return client
    except Exception:
        _DOCKER_CLIENT_CACHE = None
        return None


IGNORED_DIRS = {"__pycache__", ".pytest_cache", ".git", ".mypy_cache"}
IGNORED_EXTS = {".pyc", ".pyo", ".pyd"}


def get_challenge_data(challenge_id: str) -> dict:
    base_dir = CHALLENGES_DIR / challenge_id
    config = yaml.safe_load((base_dir / "challenge.yaml").read_text(encoding="utf-8"))
    starter_dir = base_dir / "starter"

    files = {}
    for file_path in starter_dir.rglob("*"):
        if file_path.is_file():
            rel_path = file_path.relative_to(starter_dir).as_posix()
            files[rel_path] = file_path.read_text(encoding="utf-8")

    return {"meta": config, "files": files}


def _run_in_docker(client, temp_path: Path, config: dict) -> dict:
    cmd = f"sh -c '{config['test_command']} && {config.get('lint_command', 'true')}'"
    try:
        output = client.containers.run(
            image="repo-sandbox:latest",
            command=cmd,
            volumes={str(temp_path): {"bind": "/workspace", "mode": "rw"}},
            network_disabled=True,
            mem_limit="128m",
            nano_cpus=500_000_000,
            remove=True,
            stdout=True,
            stderr=True,
        )
        return {
            "passed": True,
            "mode": "docker_container",
            "logs": output.decode("utf-8"),
        }
    except Exception as err:
        import docker.errors
        if isinstance(err, docker.errors.ContainerError):
            raw_logs = err.stderr.decode("utf-8") if err.stderr else str(err)
            return {
                "passed": False,
                "mode": "docker_container",
                "logs": raw_logs,
            }
        raise err


# Standalone runner script template executed in an isolated child process
RUNNER_SCRIPT = """
import sys
import os
import inspect
import importlib.util
import traceback
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

starter_dir = Path(sys.argv[1]).resolve()
tests_dir = Path(sys.argv[2]).resolve()
max_line_length = int(sys.argv[3]) if len(sys.argv) > 3 else 100

sys.path.insert(0, str(starter_dir))

total_passed = 0
total_failed = 0
output_lines = []

output_lines.append("============================= REPODRILL SANDBOX RUNNER =============================")
output_lines.append(f"Workspace: {starter_dir.name} | Test Suite: {tests_dir.name}")
output_lines.append("Environment: Python " + ".".join(map(str, sys.version_info[:3])) + " [Isolated Execution]")
output_lines.append("")

# Step 1: Linter & Syntax Check
output_lines.append("--- STEP 1: CODE INTEGRITY & SYNTAX AUDIT ---")
lint_errors = []
for py_file in sorted(starter_dir.rglob("*.py")):
    rel = py_file.relative_to(starter_dir).as_posix()
    try:
        content = py_file.read_text(encoding="utf-8")
        compile(content, rel, "exec")
    except SyntaxError as syn_err:
        lint_errors.append(f"[SYNTAX ERROR] {rel}:{syn_err.lineno} -> {syn_err.msg}")
        continue

    # Line length check
    for idx, line in enumerate(content.splitlines(), start=1):
        if len(line) > max_line_length:
            lint_errors.append(f"[STYLE WARNING] {rel}:{idx} -> Line exceeds {max_line_length} chars ({len(line)})")

if lint_errors:
    output_lines.append(f"[LINT] Found {len(lint_errors)} issue(s):")
    for err in lint_errors[:10]:
        output_lines.append(f"  {err}")
    if any("SYNTAX ERROR" in e for e in lint_errors):
        output_lines.append("[FAIL] Syntax check failed. Cannot proceed with unit test execution.")
        print("\\n".join(output_lines))
        sys.exit(1)
    else:
        output_lines.append("  (Continuing to tests with style warnings...)")
else:
    output_lines.append("[LINT] Code integrity audit passed cleanly. Zero syntax errors.")

output_lines.append("")
output_lines.append("--- STEP 2: RUNNING VERIFICATION TEST SUITE ---")

test_files = sorted(tests_dir.glob("test_*.py"))
if not test_files:
    output_lines.append("[ERROR] No test files found in hidden_tests.")
    print("\\n".join(output_lines))
    sys.exit(1)

start_time = time.time()

for tf in test_files:
    rel_test = tf.name
    output_lines.append(f"Running suite: {rel_test} ...")
    try:
        spec = importlib.util.spec_from_file_location(tf.stem, tf)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
    except Exception as mod_err:
        total_failed += 1
        output_lines.append(f"  [CRITICAL ERROR] Failed to import {rel_test}: {mod_err}")
        output_lines.append(traceback.format_exc())
        continue

    # Discover and run test functions
    test_funcs = [
        (name, func) for name, func in inspect.getmembers(mod)
        if name.startswith("test_") and callable(func)
    ]

    for name, func in test_funcs:
        t_start = time.time()
        try:
            func()
            t_dur = round((time.time() - t_start) * 1000, 2)
            total_passed += 1
            output_lines.append(f"  ✓ PASSED  {name} ({t_dur}ms)")
        except AssertionError as assert_err:
            t_dur = round((time.time() - t_start) * 1000, 2)
            total_failed += 1
            output_lines.append(f"  ✗ FAILED  {name} ({t_dur}ms)")
            msg = str(assert_err)
            if msg:
                output_lines.append(f"    AssertionError: {msg}")
            # Format clean traceback
            tb_lines = traceback.format_exc().strip().splitlines()
            for line in tb_lines[-4:]:
                output_lines.append(f"    {line}")
        except Exception as exc:
            t_dur = round((time.time() - t_start) * 1000, 2)
            total_failed += 1
            output_lines.append(f"  ✗ ERROR   {name} ({t_dur}ms): {type(exc).__name__}: {exc}")
            tb_lines = traceback.format_exc().strip().splitlines()
            for line in tb_lines[-4:]:
                output_lines.append(f"    {line}")

total_duration = round(time.time() - start_time, 3)
output_lines.append("")
output_lines.append("================================ TEST SUMMARY ================================")
output_lines.append(f"Results: {total_passed} passed, {total_failed} failed in {total_duration}s")

if total_failed == 0 and not any("SYNTAX ERROR" in e for e in lint_errors):
    output_lines.append("STATUS: ALL TESTS & CODE AUDIT CHECKS PASSED [SUCCESS]")
    print("\\n".join(output_lines))
    sys.exit(0)
else:
    output_lines.append(f"STATUS: VERIFICATION FAILED ({total_failed} test failures or syntax errors)")
    print("\\n".join(output_lines))
    sys.exit(1)
"""


def _run_in_isolated_process(temp_path: Path, config: dict) -> dict:
    starter_dest = temp_path / "starter"
    tests_dest = temp_path / "hidden_tests"
    runner_file = temp_path / "sandbox_runner.py"
    runner_file.write_text(RUNNER_SCRIPT, encoding="utf-8")

    env = os.environ.copy()
    env["PYTHONPATH"] = str(starter_dest)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    try:
        proc = subprocess.run(
            [
                sys.executable,
                str(runner_file),
                str(starter_dest),
                str(tests_dest),
                "100",
            ],
            capture_output=True,
            text=True,
            timeout=8,
            cwd=str(temp_path),
            env=env,
        )
        combined_logs = (proc.stdout + "\n" + proc.stderr).strip()
        passed = proc.returncode == 0
        return {
            "passed": passed,
            "mode": "isolated_sandbox",
            "logs": combined_logs,
        }
    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "mode": "isolated_sandbox",
            "logs": "[TIMEOUT ERROR] Execution exceeded maximum time limit of 8.0s.\nPossible infinite loop or blocking I/O detected in submission.",
        }
    except Exception as exc:
        return {
            "passed": False,
            "mode": "isolated_sandbox",
            "logs": f"[SANDBOX ERROR] Failed to execute sandbox runner: {exc}",
        }


def evaluate_submission(challenge_id: str, modified_files: dict[str, str], enqueued_at: float) -> dict:
    started_at = time.perf_counter()
    queue_wait_ms = round((started_at - enqueued_at) * 1000, 2)

    base_dir = CHALLENGES_DIR / challenge_id
    config = yaml.safe_load((base_dir / "challenge.yaml").read_text(encoding="utf-8"))

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        starter_dest = temp_path / "starter"
        tests_dest = temp_path / "hidden_tests"

        shutil.copytree(base_dir / "starter", starter_dest)
        shutil.copytree(base_dir / "hidden_tests", tests_dest)

        # Path traversal protection
        for rel_path, content in modified_files.items():
            target = (starter_dest / rel_path).resolve()
            if starter_dest.resolve() in target.parents:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content, encoding="utf-8")

        cmd = f"sh -c '{config['test_command']} && {config['lint_command']}'"

        try:
            output = client.containers.run(
                image="repo-sandbox:latest",
                command=cmd,
                volumes={str(temp_path): {"bind": "/workspace", "mode": "rw"}},
                network_disabled=True,
                mem_limit="128m",
                nano_cpus=500_000_000,
                remove=True,
                stdout=True,
                stderr=True,
            )
            exec_ms = round((time.perf_counter() - started_at) * 1000, 2)
            print(f"[METRICS] PASSED | queue_wait={queue_wait_ms}ms | docker_exec={exec_ms}ms")
            return {
                "passed": True,
                "logs": output.decode("utf-8"),
                "metrics": {"queue_wait_ms": queue_wait_ms, "docker_exec_ms": exec_ms},
            }

        except docker.errors.ContainerError as err:
            exec_ms = round((time.perf_counter() - started_at) * 1000, 2)
            raw_logs = err.stderr.decode("utf-8") if err.stderr else str(err)
            print(f"[METRICS] FAILED | queue_wait={queue_wait_ms}ms | docker_exec={exec_ms}ms")
            return {
                "passed": False,
                "logs": raw_logs,
                "metrics": {"queue_wait_ms": queue_wait_ms, "docker_exec_ms": exec_ms},
            }
