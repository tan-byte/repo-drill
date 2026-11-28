import time
from locust import HttpUser, between, task


class RepoDrillLoadUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def submit_and_poll(self):
        # 1. Enqueue submission through Nginx
        res = self.client.post(
            "/challenges/01-fix-discount-bug/submit",
            json={
                "files": {
                    "cart.py": "def calculate_total(items, promo_code=None):\n    return round(sum(items) * 0.8, 2)\n"
                }
            },
            name="/submit (enqueue)",
        )
        if res.status_code != 200:
            return

        job_id = res.json()["job_id"]

        # 2. Poll until worker finishes grading
        for _ in range(30):
            poll = self.client.get(f"/jobs/{job_id}", name="/jobs/[id] (poll)")
            if poll.status_code == 200 and poll.json().get("status") == "finished":
                break
            time.sleep(0.5)
