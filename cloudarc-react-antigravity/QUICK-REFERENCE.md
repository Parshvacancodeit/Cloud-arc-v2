# CloudArc Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 File Locations Cheat Sheet

```
Components:    src/components/
Pages:         src/pages/
Styles:        src/styles/
Utils:         src/utils/
Routes:        src/App.jsx
Entry:         src/main.jsx
```

## 🎨 Color Variables

```css
var(--cyan)       /* #00ADB5 - Primary */
var(--orange)     /* #FF5722 - Accent */
var(--white)      /* #FFFFFF */
var(--off-white)  /* #F8F9FA */
var(--text-dark)  /* #1A1A2E */
var(--text-gray)  /* #64748B */
```

## 🔗 Current Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page |
| `/login` | Login | User login |
| `/signup` | Signup | Registration |

## 📦 Key Dependencies

```json
"react": "^18.2.0"
"react-dom": "^18.2.0"
"react-router-dom": "^6.20.0"
"vite": "4.5.0"
```

## 🎯 Common Code Snippets

### Create New Component
```jsx
import '../styles/ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="component-name">
      {/* Content */}
    </div>
  );
};

export default ComponentName;
```

### Add New Route
```jsx
// In App.jsx
import NewPage from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

### useState Hook
```jsx
const [state, setState] = useState(initialValue);

// Update state
setState(newValue);

// Update with previous state
setState(prev => prev + 1);
```

### useEffect Hook
```jsx
useEffect(() => {
  // Side effect code
  
  return () => {
    // Cleanup (optional)
  };
}, [dependencies]);
```

### Form Handling
```jsx
const [formData, setFormData] = useState({ field: '' });

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
};

<input 
  name="field" 
  value={formData.field} 
  onChange={handleChange}
/>
```

### Navigation
```jsx
import { Link, useNavigate } from 'react-router-dom';

// Link component
<Link to="/path">Text</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate('/path');
```

### API Call Pattern
```jsx
const fetchData = async () => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 🎨 Common CSS Classes

```css
/* Layout */
.container         /* Max-width container */
.section          /* Section padding */

/* Buttons */
.btn              /* Base button */
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.btn-submit       /* Submit button */

/* Forms */
.form-group       /* Form field wrapper */
.form-label       /* Label */
.form-input       /* Input field */
.error            /* Error state */
.error-message    /* Error text */

/* Animations */
.scroll-fade-in      /* Fade in on scroll */
.scroll-slide-left   /* Slide from left */
.scroll-slide-right  /* Slide from right */
```

## 📱 Responsive Breakpoints

```css
/* Desktop: > 1024px (default) */

@media (max-width: 1024px) {
  /* Tablet */
}

@media (max-width: 768px) {
  /* Mobile */
}
```

## 🔧 Vite Config Quick Edit

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // Change port
    open: true         // Auto-open browser
  }
})
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | `npm install` |
| Port in use | Change port in vite.config.js |
| Styles not applying | Check import, clear cache |
| Route not working | Check App.jsx routes |
| Build errors | Delete node_modules, reinstall |

## 📝 Git Quick Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b feature-name

# Switch branch
git checkout branch-name
```

## 🎯 VS Code Shortcuts (Recommended)

```
Ctrl/Cmd + P     → Quick file open
Ctrl/Cmd + B     → Toggle sidebar
Ctrl/Cmd + /     → Comment/uncomment
Alt + Up/Down    → Move line up/down
Ctrl/Cmd + D     → Select next occurrence
F2               → Rename symbol
Ctrl/Cmd + `     → Toggle terminal
```

## 📚 Quick Links

- [React Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite Docs](https://vitejs.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 🔑 Environment Variables (Future)

```bash
# Create .env file
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=CloudArc

# Access in code
import.meta.env.VITE_API_URL
```

## 🎨 Component Import Patterns

```jsx
// React hooks
import { useState, useEffect } from 'react';

// Router
import { Link, useNavigate, useParams } from 'react-router-dom';

// Local components
import Navbar from '../components/Navbar';

// Styles
import '../styles/ComponentName.css';
```

## 📦 Adding New Dependencies

```bash
# Install package
npm install package-name

# Install dev dependency
npm install -D package-name

# Uninstall package
npm uninstall package-name

# Update package
npm update package-name
```

---

**Pro Tip**: Bookmark this file for quick reference during development!
