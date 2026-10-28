# Dummy REST API (Go & Cloudflare Edge)

A high-performance mock API that generates $N$ dummy responses with 10 realistic fields on demand, with **Zero Cold Start** and **100% Lifetime-Free hosting**.

---

## ⚡ How to Get ZERO Cold Start (Lifetime Free)

Standard free tiers (like Render, Vercel, or AWS Lambda) go to sleep after 10–15 minutes of inactivity, causing cold starts of 1 to 30 seconds.

Here are the two ways this project gives you **permanent zero cold start**:

### Method 1: Cloudflare Workers (True 0ms Edge Cold Start)
Cloudflare Workers run on V8 isolates distributed across 300+ global edge locations. They boot in sub-milliseconds with **literally 0ms cold start**.
* **Free allowance**: 100,000 requests per day (~3,000,000/month) 100% free forever.
* **How to deploy in 60 seconds**:
  1. Go to [Cloudflare Dashboard > Workers & Pages](https://dash.cloudflare.com/) (free account).
  2. Click **Create Application** > **Create Worker**.
  3. Click **Deploy**, then click **Edit code**.
  4. Copy and paste the contents of [`cloudflare-worker/worker.js`](./cloudflare-worker/worker.js) into the editor.
  5. Click **Save and Deploy**. You instantly get a live `https://dummy-api.<subdomain>.workers.dev` URL with 0ms cold start globally!

*(Or run `cd cloudflare-worker && npx wrangler deploy`)*

---

### Method 2: Render Free Web Service + Included Keep-Alive Warmer
If you want to run the compiled **Go backend** directly:
1. Click **[Deploy to Render](https://render.com/deploy?repo=https://github.com/shreyashsutane/dummy-api)** (Free Go Web Service).
2. Render gives you 750 free hours per month (enough for 24/7 uptime in a 744-hour month).
3. To prevent Render's 15-minute sleep timer from ever triggering, this repository includes [`.github/workflows/keep-alive.yml`](./.github/workflows/keep-alive.yml).
4. Go to your GitHub repository **Settings > Secrets and variables > Actions**, add secret `SERVICE_URL` with your Render URL (e.g. `https://dummy-api-xxxx.onrender.com`).
5. GitHub Actions will automatically ping your service every 10 minutes, keeping your Go container **warm 24/7 with zero cold start**!

---

## Endpoints & Features

### `GET /api/items` (or `/api/users`)
Returns an array of $N$ dummy items with 10 realistic fields:
`id`, `name`, `email`, `role`, `status`, `phone`, `avatar`, `city`, `bio`, `created_at`.

#### Query Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| `count` (or `limit`, `n`) | `10` | Number of items to generate (1 - 1000). |
| `seed` | `""` | Any string or number to generate reproducible results. |
| `delay` | `""` | Simulated latency duration (e.g., `100ms`, `500ms`). |

#### Example Requests
```bash
# Get 5 items
curl "https://<your-service-url>/api/items?count=5"

# Get 20 users with simulated delay
curl "https://<your-service-url>/api/users?count=20&delay=300ms"

# Get reproducible data with a seed
curl "https://<your-service-url>/api/users?count=10&seed=test-run-1"
```

### `GET /health`
Returns `{"status": "ok"}` for health checks and keep-alive pingers.
