# Main-Cloudarc

CloudArc is a multi-app cloud kitchen platform in a single workspace.
This repository contains:

1. A restaurant operations dashboard (React + Vite)
2. A customer ordering app (React + Vite)
3. A partner ordering app (React + Vite)
4. A Flask backend API with SQLite persistence

This README is written from analysis of your current workspace and run scripts, without changing code.

## Monorepo Overview

- cloudarc-react-antigravity
  Main restaurant app (dashboard, auth, analytics, menu, team, settings) and backend service under backend/
- cloudarc-customer-antigravity
  Customer-facing app for browsing restaurants, menus, and placing orders
- cloudarc-partner-antigravity
  Partner-facing app with similar ordering flow and source tracking
- dev.sh
  Unified local startup script for backend + all frontend apps
- deploy_prep.sh
  Helper script for initializing and staging deployment setup
- deployment_roadmap.md
  Deployment guidance for Render and Vercel/Netlify

## Tech Stack

Frontend:
- React 18
- React Router DOM 6
- Vite 4
- React Icons

Backend:
- Flask 3
- Flask-Cors
- PyJWT
- python-dotenv
- Gunicorn
- SQLite

## Local Ports

Default local services:

- Backend API: http://localhost:5001
- Restaurant app: http://localhost:3000
- Customer app: http://localhost:5173
- Partner app: http://localhost:5174

## Environment Configuration

Frontend apps use VITE_API_URL for API base URL.

- Customer app falls back to http://localhost:5001 if VITE_API_URL is missing
- Partner app falls back to http://localhost:5001 if VITE_API_URL is missing
- Restaurant app expects VITE_API_URL and otherwise uses relative paths

Backend reads environment from .env via python-dotenv. Important keys:
- SECRET_KEY
- DATABASE
- DEBUG

## Project Structure

    Main-Cloudarc/
    ├── deploy_prep.sh
    ├── deployment_roadmap.md
    ├── dev.sh
    ├── cloudarc-customer-antigravity/
    │   ├── src/
    │   │   ├── context/
    │   │   └── services/
    │   └── package.json
    ├── cloudarc-partner-antigravity/
    │   ├── src/
    │   │   ├── context/
    │   │   └── services/
    │   └── package.json
    └── cloudarc-react-antigravity/
        ├── backend/
        │   ├── app.py
        │   ├── config.py
        │   ├── database.py
        │   ├── schema.sql
        │   ├── routes/
        │   └── requirements.txt
        ├── src/
        │   ├── components/
        │   ├── hooks/
        │   ├── pages/
        │   ├── services/
        │   └── styles/
        └── package.json

## Prerequisites

- Node.js 16+ (recommended 18+)
- npm 8+
- Python 3.10+ (or compatible with Flask 3)
- pip
- Git

## Quick Start

### 1) Install frontend dependencies

    cd cloudarc-react-antigravity
    npm install

    cd ../cloudarc-customer-antigravity
    npm install

    cd ../cloudarc-partner-antigravity
    npm install

### 2) Install backend dependencies

    cd ../cloudarc-react-antigravity/backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

### 3) Run all services together (recommended)

From repository root:

    bash dev.sh

This starts backend and all three frontend apps.

### 4) Run services manually (alternative)

Backend:

    cd cloudarc-react-antigravity/backend
    source .venv/bin/activate
    python3 app.py

Restaurant app:

    cd cloudarc-react-antigravity
    npm run dev

Customer app:

    cd cloudarc-customer-antigravity
    npm run dev

Partner app:

    cd cloudarc-partner-antigravity
    npm run dev

## Available Scripts

For each frontend app:

- npm run dev
- npm run build
- npm run preview

Root scripts:

- bash dev.sh
- bash deploy_prep.sh

## API Surface (High Level)

Backend registers blueprints for:

- auth
- dashboard
- orders
- menu
- team
- analytics
- settings
- public
- customer_auth
- db_viewer

Health endpoint:

- GET /api/health

## Deployment Notes

Current roadmap in deployment_roadmap.md suggests:

- Backend: Render (Flask + Gunicorn)
- Frontends: Vercel or Netlify (Vite)
- Set VITE_API_URL in frontend deployment environment
- Update backend CORS origins for deployed frontend URLs

Important note:
- SQLite is easy for demos but not ideal for persistent production usage on ephemeral disks

## Known Repository Notes

- No frontend test scripts are currently defined in package.json files
- The partner app repository state may include tracked dependency files; clean git hygiene is recommended before long-term maintenance

## Troubleshooting

Port conflicts:
- If one of 3000, 5173, 5174, or 5001 is occupied, stop the conflicting process or run app commands individually and allow Vite to choose another port.

CORS errors:
- Confirm backend allowed origins include your frontend origin.
- Confirm frontend VITE_API_URL points to the correct backend URL.

API connectivity issues:
- Check backend health endpoint at http://localhost:5001/api/health.
- Verify token-based requests include Authorization header where required.

## License

This project appears to be an academic/final-year style implementation.
Add an explicit license file if you plan to distribute it publicly.
