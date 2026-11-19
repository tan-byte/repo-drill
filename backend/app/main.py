import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yaml
from app.runner import CHALLENGES_DIR, evaluate_submission, get_challenge_data, get_docker_client

app = FastAPI(title="RepoDrill API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SubmissionRequest(BaseModel):
    files: dict[str, str]


@app.get("/system/status")
def system_status():
    docker_ready = get_docker_client() is not None
    challenges = [f.name for f in CHALLENGES_DIR.iterdir() if f.is_dir() and (f / "challenge.yaml").is_file()]
    return {
        "status": "healthy",
        "sandbox_mode": "docker_container" if docker_ready else "isolated_process_sandbox",
        "docker_available": docker_ready,
        "python_version": sys.version.split()[0],
        "total_challenges": len(challenges),
    }


@app.get("/challenges")
def list_challenges():
    items = []
    if not CHALLENGES_DIR.exists():
        return items

    for folder in sorted(CHALLENGES_DIR.iterdir()):
        cfg_file = folder / "challenge.yaml"
        if cfg_file.is_file():
            try:
                data = yaml.safe_load(cfg_file.read_text(encoding="utf-8"))
                starter_dir = folder / "starter"
                file_names = []
                if starter_dir.is_dir():
                    for f in starter_dir.rglob("*"):
                        if f.is_file() and not any(part in {"__pycache__", ".git"} for part in f.parts) and not f.name.endswith(".pyc"):
                            file_names.append(f.relative_to(starter_dir).as_posix())

                items.append({
                    "id": data.get("id", folder.name),
                    "title": data.get("title", folder.name),
                    "mode": data.get("mode", "Practice"),
                    "difficulty": data.get("difficulty", "Medium"),
                    "category": data.get("category", "General"),
                    "estimated_minutes": data.get("estimated_minutes", 15),
                    "tags": data.get("tags", []),
                    "description": data.get("description", ""),
                    "files_count": len(file_names),
                    "file_names": sorted(file_names),
                })
            except Exception as e:
                print(f"Error parsing {cfg_file}: {e}")
                continue
    return items


@app.get("/challenges/{challenge_id}")
def fetch_challenge(challenge_id: str):
    target = CHALLENGES_DIR / challenge_id
    if not target.is_dir() or not (target / "challenge.yaml").is_file():
        raise HTTPException(status_code=404, detail="Challenge not found")
    return get_challenge_data(challenge_id)


@app.post("/challenges/{challenge_id}/submit")
def submit_solution(challenge_id: str, payload: SubmissionRequest):
    target = CHALLENGES_DIR / challenge_id
    if not target.is_dir() or not (target / "challenge.yaml").is_file():
        raise HTTPException(status_code=404, detail="Challenge not found")
    return evaluate_submission(challenge_id, payload.files)
