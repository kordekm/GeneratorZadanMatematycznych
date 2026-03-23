#!/usr/bin/env bash
set -e

# Navigate to project root directory (directory of this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------- Backend ----------
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi
if [ ! -d "dist" ]; then
  echo "Building backend..."
  npm run build
fi
echo "Starting backend..."
node dist/server.js &

# ---------- Frontend ----------
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi
echo "Starting frontend development server..."
npm run dev &

# Wait for both processes to exit (keeps script running)
wait
