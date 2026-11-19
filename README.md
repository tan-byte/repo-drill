# RepoDrill 🏋️‍♂️

> **The Safe Practice Gym for Real-World Software Jobs**

RepoDrill is an interactive coding practice platform where developers fix real production bugs, diagnose broken stack traces, and implement features across small, authentic **multi-file repositories** instead of solving single-file algorithmic puzzles.

Untrusted code modifications are mounted and executed inside an isolated, locked-down **sandbox** (`network_disabled=True`, 128MB RAM limit, CPU quota) to safely test work without risking the host machine.

---

## 🌟 Key Highlights

- **Multi-File Architecture**: Edit imports, models, utilities, and tests just like a real developer workspace.
- **Cool & Helpful Homepage**: Hero showcase, live sandbox security architecture flow, category filters, difficulty tags, live search, and repository file inspection peekers.
- **Formal & Minimal Workspace**: Clean, distraction-free IDE with line numbers gutter, tab indentation, file explorer, markdown scenario brief, progressive hints, and a dark terminal console.
- **Locked-Down Sandbox**: Untrusted submissions are tested in ephemeral Docker containers (or isolated execution sandboxes) with network disabled, memory limits, and path traversal guards.
- **Comprehensive Drill Library**: 6 rich starter drills covering bug triage, security audits, distributed systems, streaming optimization, and concurrency.

---

## 📚 Drill Catalog

| ID | Title | Category | Difficulty | Mode | Key Files |
|---|---|---|---|---|---|
| `01-fix-discount-bug` | **Fix Promo Code Calculation Bug** | Bug Fixing | Easy | Bug Fix | `cart.py`, `promo.py`, `models.py` |
| `02-jwt-token-expiration` | **Fix JWT Expiration & Role Authorization** | Security & Auth | Medium | Security Audit | `auth.py`, `middleware.py`, `models.py` |
| `03-rate-limiter-sliding-window` | **Implement Sliding Window Rate Limiter** | Feature Addition | Medium | Feature Addition | `rate_limiter.py`, `storage.py`, `config.py` |
| `04-csv-memory-stream` | **Fix Memory Spike in Large CSV Exporter** | Optimization | Hard | Refactoring | `exporter.py`, `streamer.py`, `data_source.py` |
| `05-webhook-retry-dispatcher` | **Add Exponential Backoff to Webhook Dispatcher** | Feature Addition | Medium | Feature Addition | `dispatcher.py`, `retry_policy.py`, `events.py` |
| `06-inventory-race-condition` | **Prevent Inventory Allocation Race Condition** | Bug Fixing | Hard | Bug Fix | `inventory_service.py`, `warehouse.py`, `order.py` |

---

## 🚀 Quick Start

### 1. Start the Backend API
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
API runs at `http://localhost:8000` with endpoints:
- `GET /challenges` — list all drills with metadata and file previews
- `GET /challenges/{id}` — load drill files and scenario configuration
- `POST /challenges/{id}/submit` — run tests in isolated sandbox
- `GET /system/status` — check Docker container readiness and health

### 2. Start the Frontend Workspace
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

*(Note: The frontend also embeds default drill metadata so you can explore the catalog and workspace right out of the box).*

---

## 🔒 Security Architecture

```
User Browser (Workspace IDE)
           │
           │ POST /challenges/{id}/submit
           ▼
FastAPI Backend (Path Traversal Sanitation)
           │
           │ Mounts temporary ephemeral directory
           ▼
Docker Sandbox Container / Isolated Process
  ├── Network: Disabled (`network_disabled=True`)
  ├── Memory limit: 128 MB
  ├── Nano CPUs: 0.5 core
  ├── Read-Only: Hidden Pytest Test Suite
  └── Execution: Pytest assertions + PEP8 style check
           │
           ▼
Formatted Console Logs & Pass/Fail Status Returned to UI
```
