#!/bin/bash
set -e
export PYTHONPATH=.
echo "🚀 Starting ILRDVS Backend on http://127.0.0.1:8000 ..."
echo "📖 Swagger API Docs: http://127.0.0.1:8000/docs"
./backend/.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
