#!/bin/bash
# Start the math generator backend
cd "$(dirname "$0")"

echo "=== Math Generator Backend ==="
echo "Starting server..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -d "dist" ]; then
    echo "Building TypeScript..."
    npm run build
fi

echo "Starting backend on port ${PORT:-3001}..."
node dist/server.js
