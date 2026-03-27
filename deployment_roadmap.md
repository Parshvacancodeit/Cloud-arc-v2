# ☁️ CloudArc Deployment Roadmap (Free Tier)

This guide outlines how to deploy the entire CloudArc ecosystem for free.

## 1. Backend (Flask + SQLite) -> [Render.com](https://render.com)

Render offers a Free Instance type that is perfect for web services.

### Steps:
1. **GitHub**: Push your code to a GitHub repository.
2. **New Web Service**: Connect your repo to Render.
3. **Environment**:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (You may need to `pip install gunicorn`)
4. **Environment Variables**:
   - Add any vars from your `.env` (like `SECRET_KEY`).
5. **Database**: Since we use SQLite, the `cloudarc.db` file will stay on the disk. *Note: Render's free tier has an ephemeral disk (files disappear on restart). For a persistent DB on free tier, consider using Supabase (PostgreSQL) and updating `database.py`.*

---

### 2. Frontend (React/Vite) -> [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

Vercel is the easiest for Vite apps.

### Steps:
1. **Connect GitHub**: Import your repository.
2. **Framework Preset**: Select `Vite`.
3. **Root Directory**: Select the specific folder (`cloudarc-customer-antigravity` or `cloudarc-react-antigravity`).
4. **Environment Variables**:
   - Add `VITE_API_URL` pointing to your Render backend URL (e.g., `https://cloudarc-api.onrender.com`).
5. **Deploy**: Hit deploy!

---

## 🔗 Where to replace Local URLs with Production URLs

Once your apps are deployed, you need to tell the frontends where the backend is, and tell the backend which frontends are allowed to talk to it.

### 1. Frontend -> Backend (API URL)
You **don't** need to change the code. Instead, set the `VITE_API_URL` environment variable in your **Vercel/Netlify dashboard**:
- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend-name.onrender.com`

**Files that use this:**
- [Customer App API](file:///Users/parshvapatel/Desktop/Main-Cloudarc/cloudarc-customer-antigravity/src/services/api.js) (Line 4)
- [Restaurant App API](file:///Users/parshvapatel/Desktop/Main-Cloudarc/cloudarc-react-antigravity/src/services/api.js) (Line 5)

### 2. Backend -> Frontend (CORS)
In your backend [app.py](file:///Users/parshvapatel/Desktop/Main-Cloudarc/cloudarc-react-antigravity/backend/app.py), you need to update the allowed origins to include your Vercel URLs.

**Update this block (Lines 24-34):**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173", # Local Customer App
            "http://localhost:3000", # Local Restaurant App
            "https://your-customer-app.vercel.app", # PROD Customer App
            "https://your-restaurant-app.vercel.app", # PROD Restaurant App
        ],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})
```

---

## 3. Viewing the Database (Viva/Demo)

During your viva or demo, you can view the database tables clearly in the browser without needing any SQL tools.

- **URL**: `YOUR_BACKEND_URL/api/debug/db-viewer`
- **What it shows**: All tables (`users`, `restaurants`, `orders`, `customers`, etc.) in a clean, scrollable HTML table format.
- **Local Example**: [http://localhost:5001/api/debug/db-viewer](http://localhost:5001/api/debug/db-viewer)

---

## 4. Key Deployment Pointers
- **CORS**: Ensure your backend `app.py` allows the origin of your deployed frontend.
- **SQLite vs Postgres**: For a serious demo, a free PostgreSQL instance on **Supabase** or **Neon.tech** is recommended over SQLite for persistence on cloud platforms.
