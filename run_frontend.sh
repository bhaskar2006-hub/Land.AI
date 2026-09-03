#!/bin/bash
set -e
echo "⚡ Starting ILRDVS React 18 + Vite Frontend on http://localhost:3000 ..."
cd frontend && npm run dev -- --port 3000
