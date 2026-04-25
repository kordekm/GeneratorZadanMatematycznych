#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  trap - INT TERM EXIT
  jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# ---------- Backend (tsx watch) ----------
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi
echo "Starting backend in watch mode..."
npm run dev &

# ---------- Frontend (Vite dev) ----------
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi
echo "Starting frontend in dev mode..."
npm run dev &

wait
