# Production Deployment Checklist

Use this when deploying to your **production domain** (e.g. `https://yourdomain.com`) and connecting the **SafePay production (live) account**.

---

## Going live: what to change (summary)

| Where | What to change |
|-------|----------------|
| **Backend `.env`** | `NODE_ENV=production`, `FRONTEND_URL`/`BASE_URL` = your domain (https), production `MONGO`, strong `JWT_SECRET`/`SESSION_SECRET`, **SafePay production keys** and `SAFEPAY_ENVIRONMENT=production`, `SAFEPAY_SUCCESS_URL`/`SAFEPAY_WEBHOOK_URL` on your backend domain. |
| **SafePay Dashboard** | Use **Live Dashboard** (not Test). Copy production **Public** and **Secret** keys; set **Webhook URL**; ensure success/cancel URLs match backend and frontend. |
| **Frontend build** | Build with `VITE_API_URL=https://api.yourdomain.com/api` (or your real API URL). Deploy the `dist/` folder to your domain. |
| **Hosting** | Serve frontend and backend over **HTTPS**. Backend CORS allows only `FRONTEND_URL`. |

---

## 1. Backend environment (`.env` on server)

Set these on your **production server** (e.g. in `.env` or your host’s env vars).

### Required

| Variable | Example (production) | Notes |
|----------|----------------------|--------|
| `NODE_ENV` | `production` | Enables production checks and secure cookies |
| `PORT` | `3000` or `80` | Port your backend runs on |
| `MONGO` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Use Atlas or production MongoDB (not localhost) |
| `FRONTEND_URL` | `https://yourdomain.com` | Exact URL of your frontend (must match; use `https` in prod) |
| `SESSION_SECRET` | Long random string (32+ chars) | Never use dev value in production |
| `JWT_SECRET` | Long random string (32+ chars) | Never use `1234` or dev value in production |
| `JWT_EXPIRES_IN` | `7d` | Optional; default is fine |

### SafePay (live payments)

| Variable | Example (production) | Notes |
|----------|----------------------|--------|
| `SAFEPAY_ENVIRONMENT` | `production` | Use `production` for real payments |
| `SAFEPAY_PUBLIC_KEY` | From **Live Dashboard** | https://getsafepay.com/dashboard → Developers → API |
| `SAFEPAY_SECRET_KEY` | From **Live Dashboard** | Same place |
| `SAFEPAY_WEBHOOK_SECRET` | From **Live Dashboard** (Webhooks) | Same place |
| `SAFEPAY_SUCCESS_URL` | `https://api.yourdomain.com/api/payments/safepay/return` | Backend URL SafePay redirects to after payment |
| `SAFEPAY_CANCEL_URL` | *(optional)* | Cancel URL is **FRONTEND_URL + /catalog** by default. Set only to override. |
| `SAFEPAY_WEBHOOK_URL` | `https://api.yourdomain.com/api/payments/safepay/webhook` | Backend URL SafePay can call (must be public HTTPS) |

**SafePay production keys:** Get them from the **Live Dashboard** at https://getsafepay.com/dashboard → **Developers → API** (use the production/live keys, not the test/sandbox keys). Do not use sandbox keys when `SAFEPAY_ENVIRONMENT=production`.

### Backend public URL (for redirects / callbacks)

| Variable | Example | Notes |
|----------|---------|--------|
| `BASE_URL` | `https://api.yourdomain.com` | Public URL of your backend (for JazzCash callback, payment emails, etc.) |

### Optional (keep if you use them)

- `BCRYPT_ROUNDS` – e.g. `12`
- `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, etc. – only if you run superadmin init in production
- `SMTP_*`, `EMAIL_FROM` – for emails
- `SUPERADMIN_COMMISSION_PERCENTAGE`, `MINIMUM_PAYOUT_AMOUNT`

### Example backend production `.env` (replace placeholders)

```env
NODE_ENV=production
PORT=3000
MONGO=mongodb+srv://user:pass@cluster.mongodb.net/yourdb
FRONTEND_URL=https://yourdomain.com
BASE_URL=https://api.yourdomain.com
SESSION_SECRET=your-long-random-session-secret-32-chars-min
JWT_SECRET=your-long-random-jwt-secret-32-chars-min
JWT_EXPIRES_IN=7d

# SafePay LIVE (from Live Dashboard only)
SAFEPAY_ENVIRONMENT=production
SAFEPAY_PUBLIC_KEY=<from Live Dashboard – Developers → API>
SAFEPAY_SECRET_KEY=<from Live Dashboard – Developers → API>
SAFEPAY_WEBHOOK_SECRET=<from Live Dashboard – Webhooks>
SAFEPAY_SUCCESS_URL=https://api.yourdomain.com/api/payments/safepay/return
SAFEPAY_WEBHOOK_URL=https://api.yourdomain.com/api/payments/safepay/webhook
# Cancel URL defaults to FRONTEND_URL/catalog; set SAFEPAY_CANCEL_URL only to override
```

---

## 2. Frontend build (production API URL)

The frontend must call your **production API**, not localhost.

### Option A: Build with env (recommended)

Before building, set:

```bash
# Linux/macOS
export VITE_API_URL=https://api.yourdomain.com/api
npm run build

# Windows (PowerShell)
$env:VITE_API_URL="https://api.yourdomain.com/api"; npm run build
```

Replace `https://api.yourdomain.com` with your real backend URL (e.g. `https://api.yourdomain.com` or `https://yourdomain.com/api` if API is on same domain).

### Option B: `.env.production`

Create `frontend/.env.production`:

```
VITE_API_URL=https://api.yourdomain.com/api
```

Then run `npm run build` in the frontend folder. Vite uses `.env.production` for production builds.

---

## 3. CORS

Backend allows only `FRONTEND_URL` in production. So:

- `FRONTEND_URL` must be exactly the origin of the site users open (e.g. `https://yourdomain.com`).
- No trailing slash: use `https://yourdomain.com`, not `https://yourdomain.com/`.

---

## 4. SafePay Live Dashboard (production account)

1. Log in at **https://getsafepay.com/dashboard** (use your **live/production** account, not sandbox).
2. **Developers → API**: copy the **production** (live) **Public key** and **Secret key** into your backend `.env` as `SAFEPAY_PUBLIC_KEY` and `SAFEPAY_SECRET_KEY`. Do not use test/sandbox keys when going live.
3. **Webhooks**: add a webhook with URL `https://api.yourdomain.com/api/payments/safepay/webhook` (your real backend URL). Copy the **Webhook secret** into `SAFEPAY_WEBHOOK_SECRET` in `.env`.
4. Ensure success/cancel behavior: your backend already sends `redirect_url` = `SAFEPAY_SUCCESS_URL` and `cancel_url` = `FRONTEND_URL/catalog` (or `SAFEPAY_CANCEL_URL`). No need to set these in the dashboard if your backend env is correct.

---

## 5. HTTPS

- Serve both frontend and backend over **HTTPS** in production.
- Set `FRONTEND_URL` and `BASE_URL` to `https://...` URLs.

---

## 6. Quick checklist

- [ ] Backend: `NODE_ENV=production`
- [ ] Backend: `MONGO` = production DB (e.g. Atlas)
- [ ] Backend: `FRONTEND_URL` = `https://yourdomain.com` (exact)
- [ ] Backend: `SESSION_SECRET` and `JWT_SECRET` = strong random strings
- [ ] Backend: `BASE_URL` = public backend URL (e.g. `https://api.yourdomain.com`)
- [ ] Backend: SafePay production keys and `SAFEPAY_ENVIRONMENT=production`
- [ ] Backend: `SAFEPAY_SUCCESS_URL` and `SAFEPAY_WEBHOOK_URL` use production backend domain; cancel = FRONTEND_URL/catalog
- [ ] Frontend: built with `VITE_API_URL=https://api.yourdomain.com/api`
- [ ] SafePay Live Dashboard: webhook and URLs configured
- [ ] Both app and API served over HTTPS

---

## 7. After deployment

- Open the site in a browser and try: login, open a book, start a payment (can cancel on SafePay).
- Check backend logs for CORS or 500 errors.
- In SafePay Live Dashboard, confirm test payment appears (if you completed one).
