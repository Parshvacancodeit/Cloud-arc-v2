#!/usr/bin/env bash
# ============================================================
# CloudArc — One-Command Dev Startup
# Usage: bash start.sh
# Starts Flask backend (:5001) + Vite frontend (:3000)
# Demo login: demo@cloudarc.com / demo1234
# ============================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       CloudArc — Starting Dev Server     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Install Python dependencies ─────────────────────────
echo "📦 Installing Python dependencies..."
cd "$BACKEND"
pip install -r requirements.txt -q

# ── 2. Seed demo data ───────────────────────────────────────
echo "🌱 Seeding demo database..."
python seed.py

# ── 3. Start Flask in background ────────────────────────────
echo "🐍 Starting Flask API on http://localhost:5000 ..."
python app.py &
FLASK_PID=$!

# ── 4. Install Node dependencies ────────────────────────────
echo "📦 Installing Node dependencies..."
cd "$ROOT"
npm install -q

# ── 5. Start Vite frontend ───────────────────────────────────
echo "⚡ Starting Vite frontend on http://localhost:3000 ..."
echo ""
echo "  🔑  Demo login: demo@cloudarc.com / demo1234"
echo ""
npm run dev

# Cleanup Flask on exit
trap "kill $FLASK_PID 2>/dev/null" EXIT
