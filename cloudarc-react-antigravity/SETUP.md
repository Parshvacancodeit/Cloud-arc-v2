# CloudArc React - Setup & Development Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For version control

Check your versions:
```bash
node --version
npm --version
git --version
```

## 🚀 Getting Started

### 1. Project Setup

```bash
# Navigate to your project directory
cd cloudarc-react

# Install all dependencies
npm install
```

This will install:
- React (18.2.0)
- React DOM (18.2.0)
- React Router DOM (6.20.0)
- Vite (4.5.0)
- @vitejs/plugin-react (4.6.0)

### 2. Development Server

```bash
# Start the development server
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`

### 3. Building for Production

```bash
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

## 📂 Project Structure Explained

```
cloudarc-react/
│
├── public/                    # Static assets
│   └── (images, icons, etc.)
│
├── src/                       # Source code
│   │
│   ├── components/           # Reusable components
│   │   ├── Navbar.jsx       # Navigation component
│   │   └── Footer.jsx       # Footer component
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Home.jsx        # Landing page
│   │   ├── Login.jsx       # Login page
│   │   └── Signup.jsx      # Registration page
│   │
│   ├── styles/             # CSS files
│   │   ├── global.css     # Global styles & variables
│   │   ├── Navbar.css     # Navbar styles
│   │   ├── Footer.css     # Footer styles
│   │   ├── Home.css       # Home page styles
│   │   ├── Login.css      # Login page styles
│   │   └── Signup.css     # Signup page styles
│   │
│   ├── utils/             # Utility functions (empty for now)
│   │
│   ├── App.jsx            # Main app with routing
│   └── main.jsx           # Entry point
│
├── index.html             # HTML template
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite configuration
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
└── SETUP.md             # This file
```

## 🎨 Customizing the Application

### Adding a New Page

1. **Create the page component**:
```bash
# Create new file in src/pages/
touch src/pages/Dashboard.jsx
```

2. **Create the page styles**:
```bash
touch src/styles/Dashboard.css
```

3. **Add the component**:
```jsx
// src/pages/Dashboard.jsx
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
    </div>
  );
};

export default Dashboard;
```

4. **Add route in App.jsx**:
```jsx
import Dashboard from './pages/Dashboard';

// In the Routes component:
<Route path="/dashboard" element={<Dashboard />} />
```

### Adding a New Component

1. **Create component file**:
```bash
touch src/components/OrderCard.jsx
```

2. **Create component styles** (optional):
```bash
touch src/styles/OrderCard.css
```

3. **Define the component**:
```jsx
// src/components/OrderCard.jsx
import '../styles/OrderCard.css';

const OrderCard = ({ order }) => {
  return (
    <div className="order-card">
      {/* Component content */}
    </div>
  );
};

export default OrderCard;
```

4. **Use in a page**:
```jsx
import OrderCard from '../components/OrderCard';
```

## 🔧 Working with Styles

### Using CSS Variables

All color and design tokens are defined in `src/styles/global.css`:

```css
:root {
  --cyan: #00ADB5;
  --orange: #FF5722;
  --white: #FFFFFF;
  --off-white: #F8F9FA;
  --text-dark: #1A1A2E;
  --text-gray: #64748B;
}
```

Use them in any CSS file:
```css
.my-element {
  background: var(--cyan);
  color: var(--white);
}
```

### Adding New Styles

1. **Component-specific styles**: Create a new CSS file in `src/styles/`
2. **Import in component**:
```jsx
import '../styles/MyComponent.css';
```

## 🔌 API Integration

### Setting Up API Calls

1. **Create an API utility** (recommended):
```bash
touch src/utils/api.js
```

2. **Define API functions**:
```javascript
// src/utils/api.js
const API_BASE_URL = 'http://localhost:5001/api/v1';

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/onboarding/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

3. **Use in components**:
```jsx
import { login } from '../utils/api';

const handleLogin = async () => {
  try {
    const data = await login(email, password);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# If port 3000 is busy, Vite will automatically use 3001, 3002, etc.
# Or specify a different port in vite.config.js
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styles Not Applying
- Ensure CSS file is imported in the component
- Check for typos in class names
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Routing Not Working
- Ensure React Router is properly installed
- Check that routes are defined in App.jsx
- Verify Link components use correct paths

## 📱 Testing Responsive Design

### Browser DevTools
1. Open DevTools (F12 or Cmd+Option+I)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1440px, 1920px

## 🔄 Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Regular Workflow
```bash
# Pull latest changes
git pull origin main

# Make changes, then:
git add .
git commit -m "Description of changes"
git push origin main
```

### Feature Branches (Recommended)
```bash
# Create feature branch
git checkout -b feature/dashboard

# Work on feature...
git add .
git commit -m "Add dashboard layout"

# Push feature branch
git push origin feature/dashboard

# Merge to main after review
git checkout main
git merge feature/dashboard
git push origin main
```

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Drag the `dist` folder to Netlify
3. Configure build settings if needed

### Custom Server
```bash
# Build the project
npm run build

# Copy dist/ folder to server
# Configure nginx or Apache to serve static files
```

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [CSS Tricks](https://css-tricks.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 🤝 Collaboration Tips

### Code Style
- Use consistent naming (camelCase for variables, PascalCase for components)
- Add comments for complex logic
- Keep components small and focused
- Extract reusable logic into utilities

### Before Committing
1. Test your changes
2. Check for console errors
3. Ensure responsive design works
4. Update documentation if needed

## 📞 Getting Help

If you encounter issues:
1. Check this guide
2. Review component documentation in README.md
3. Search for error messages
4. Ask team members
5. Check React/Vite documentation

---

Happy Coding! 🎉
