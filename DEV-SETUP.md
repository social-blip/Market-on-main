# Dev Environment Setup (after restart)

## 1. Start Docker (PostgreSQL)
```bash
open -a Docker
# Wait for Docker to fully start, then:
docker start market-on-main-postgres
```
If the container doesn't exist, recreate it:
```bash
docker run -d --name market-on-main-postgres \
  -e POSTGRES_USER=market_user \
  -e POSTGRES_PASSWORD=market_pass \
  -e POSTGRES_DB=market_on_main \
  -p 5434:5432 \
  postgres:16
```

## 2. Start the Backend Server
```bash
cd /Users/jared.lauritsen/Documents/Street/server
node index.js &
```
Runs on **port 5001**. Verify: `curl http://localhost:5001/api/vendors`

## 3. Start Stripe Webhook Listener
```bash
stripe listen --forward-to localhost:5001/api/payments/webhook
```
Forwards Stripe events (payment confirmations, etc.) to your local backend. Leave running in its own terminal.

## 4. Start the React Dev Server
```bash
cd /Users/jared.lauritsen/Documents/Street/client
npm start
```
Runs on **port 3000** (or 3003 depending on config). Opens in browser automatically.

## Quick Reference

| Service       | Port | Command to check          |
|---------------|------|---------------------------|
| PostgreSQL    | 5434 | `docker ps`               |
| Backend API   | 5001 | `lsof -i :5001`           |
| Stripe webhook| 4242 | `ps aux \| grep stripe`   |
| React frontend| 3000 | `lsof -i :3000`           |

## Kill & Restart Backend
```bash
lsof -ti:5001 | xargs kill -9
cd /Users/jared.lauritsen/Documents/Street/server && node index.js &
```

## Connect to Local DB
```bash
docker exec $(docker ps -q --filter "publish=5434") psql -U market_user -d market_on_main
```

## Deploy to Production
```bash
ssh 165.232.145.5 "cd /var/www/app && git pull && cd client && npm run build"
ssh 165.232.145.5 "sudo cp -r /var/www/app/client/build/* /var/www/html/"
```
