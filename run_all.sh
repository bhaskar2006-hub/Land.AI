#!/bin/bash
set -e

cleanup() {
  echo "Stopping ILRDVS services..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

echo "🏛 Starting Intelligent Land Record Digitization & Validation System (ILRDVS)..."

# 1. Start Backend in background
./run_backend.sh &
BACKEND_PID=$!

# Wait for backend to spin up
sleep 2

# 2. Start Frontend
./run_frontend.sh &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
