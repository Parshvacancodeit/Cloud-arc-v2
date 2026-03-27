#!/usr/bin/env bash
# ============================================================
# CloudArc — Unified Dev Startup
# Usage: bash dev.sh
# Starts:
#  - Flask Backend: http://localhost:5001
#  - Restaurant App: http://localhost:3000
#  - Customer App:   http://localhost:5173
# ============================================================

# Function to kill child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM EXIT

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/cloudarc-react-antigravity/backend"
RESTAURANT="$ROOT/cloudarc-react-antigravity"
CUSTOMER="$ROOT/cloudarc-customer-antigravity"

echo "🚀 Starting CloudArc Ecosystem..."

# 1. Start Backend
echo "🐍 Starting Flask Backend on :5001..."
cd "$BACKEND"
python3 app.py > /dev/null 2>&1 &

# 2. Start Restaurant App
echo "🏢 Starting Restaurant POS (Vite) on :3000..."
cd "$RESTAURANT"
npm run dev > /dev/null 2>&1 &

# 3. Start Customer App
echo "🥘 Starting Customer App (Vite) on :5173..."
cd "$CUSTOMER"
npm run dev &

# Wait for all processes
echo ""
echo "✅ All services are starting up!"
echo "------------------------------------------------"
echo "📍 Restaurant POS: http://localhost:3000"
echo "📍 Customer App:   http://localhost:5173"
echo "📍 Backend API:    http://localhost:5001/api/health"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop everything."

wait
