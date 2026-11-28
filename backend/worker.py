from redis import Redis
from rq import Queue, SimpleWorker

redis_conn = Redis(host="localhost", port=6379, db=0)
queue = Queue("sandbox_jobs", connection=redis_conn)

if __name__ == "__main__":
    print("RepoDrill Sandbox Worker ready and listening to Redis...")
    worker = SimpleWorker([queue], connection=redis_conn)
    worker.work()
