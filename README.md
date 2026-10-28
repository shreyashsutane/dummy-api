# Dummy REST API (Go)

A high-performance, lightweight mock API written in Go that generates $N$ dummy responses with 10 realistic fields on demand.

## Features
- **Dynamic Response Count**: Request anywhere from 1 to 1,000 items dynamically via `?count=N`, `?limit=N`, or `?n=N`.
- **10 Rich Fields**: Includes `id`, `name`, `email`, `role`, `status`, `phone`, `avatar`, `city`, `bio`, and `created_at`.
- **Deterministic Seeding**: Pass `?seed=your-seed` to get reproducible data for testing.
- **Simulated Latency**: Test frontend loading indicators using `?delay=200ms` or `?delay=1s`.
- **CORS Enabled**: Out-of-the-box support for browser-based fetch and frontend development.

## Endpoints

### 1. `GET /api/items` (or `/api/users`)
Returns an array of $N$ dummy items.

#### Query Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| `count` (or `limit`, `n`) | `10` | Number of items to generate (1 - 1000). |
| `seed` | `""` | Any string or number to generate reproducible results. |
| `delay` | `""` | Simulated latency duration (e.g., `100ms`, `500ms`, `2s`). |

#### Example Requests
```bash
# Get 5 items
curl "https://<your-service-url>/api/items?count=5"

# Get 20 users with simulated 300ms network delay
curl "https://<your-service-url>/api/users?count=20&delay=300ms"

# Get reproducible data with a seed
curl "https://<your-service-url>/api/users?count=10&seed=test-run-1"
```

### 2. `GET /health`
Returns `{"status": "ok"}` for uptime monitors.
