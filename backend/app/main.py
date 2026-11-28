import os
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel
from redis import Redis
from rq import Queue
from rq.job import Job
import yaml
from app.runner import CHALLENGES_DIR, evaluate_submission, get_challenge_data

app = FastAPI(title="RepoDrill Distributed API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose /metrics for Prometheus
Instrumentator().instrument(app).expose(app)

redis_conn = Redis(host="localhost", port=6379, db=0)
task_queue = Queue("sandbox_jobs", connection=redis_conn)
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT", "10"))


class SubmissionRequest(BaseModel):
    files: dict[str, str]


def check_rate_limit(client_ip: str):
    key = f"rate_limit:{client_ip}"
    now = time.time()
    pipe = redis_conn.pipeline()
    pipe.zremrangebyscore(key, 0, now - 60)
    pipe.zcard(key)
    pipe.zadd(key, {str(now): now})
    pipe.expire(key, 60)
    _, count, _, _ = pipe.execute()

    if count >= RATE_LIMIT_PER_MIN:
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded ({RATE_LIMIT_PER_MIN}/min)")


@app.get("/challenges/{challenge_id}")
def fetch_challenge(challenge_id: str):
    if not (CHALLENGES_DIR / challenge_id).is_dir():
        raise HTTPException(status_code=404, detail="Challenge not found")
    return get_challenge_data(challenge_id)


@app.post("/challenges/{challenge_id}/submit")
def submit_solution(challenge_id: str, payload: SubmissionRequest, request: Request):
    if not (CHALLENGES_DIR / challenge_id).is_dir():
        raise HTTPException(status_code=404, detail="Challenge not found")

    client_ip = request.headers.get("X-Real-IP") or (request.client.host if request.client else "unknown")
    check_rate_limit(client_ip)

    job = task_queue.enqueue(evaluate_submission, challenge_id, payload.files, time.perf_counter())
    return {"job_id": job.id, "status": "queued"}


@app.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.is_finished:
        return {"status": "finished", "result": job.result}
    if job.is_failed:
        return {"status": "failed", "result": {"passed": False, "logs": "Sandbox worker failed."}}
    return {"status": job.get_status()}
