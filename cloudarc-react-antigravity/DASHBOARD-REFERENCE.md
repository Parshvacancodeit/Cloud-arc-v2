# CloudArc Dashboard - Quick Reference Card

## 🎯 Component Imports

```jsx
// Dashboard Pages
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import KanbanBoard from './pages/dashboard/KanbanBoard';
import MenuManagement from './pages/dashboard/MenuManagement';
import TeamManagement from './pages/dashboard/TeamManagement';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';

// Dashboard Components
import Sidebar from './components/dashboard/Sidebar';

// Styles
import '../styles/Dashboard.css';
import '../styles/DashboardHome.css';
import '../styles/KanbanBoard.css';
import '../styles/MenuManagement.css';
import '../styles/TeamManagement.css';
import '../styles/Analytics.css';
import '../styles/Settings.css';
import '../styles/Sidebar.css';
```

## 🚦 Routes

```jsx
// In App.jsx
<Route path="/dashboard/*" element={<Dashboard />} />

// In Dashboard.jsx
<Route path="/" element={<DashboardHome />} />
<Route path="/orders" element={<KanbanBoard />} />
<Route path="/menu" element={<MenuManagement />} />
<Route path="/team" element={<TeamManagement />} />
<Route path="/analytics" element={<Analytics />} />
<Route path="/settings" element={<Settings />} />
```

## 🎨 Common CSS Classes

```css
/* Buttons */
.btn-primary         /* Cyan button */
.btn-secondary       /* Off-white button */
.btn-submit          /* Orange button */

/* Containers */
.dashboard-header    /* Page header with title */
.section-header      /* Section title */
.search-box          /* Search input container */

/* Cards */
.stat-card          /* Statistics card */
.action-card        /* Clickable action card */
.menu-card          /* Menu item card */
.member-card        /* Team member card */
.order-card         /* Order card in kanban */

/* Layouts */
.stats-grid         /* 4-column stats grid */
.menu-grid          /* Menu items grid */
.team-grid          /* Team members grid */
.kanban-board       /* Kanban columns layout */

/* Forms */
.form-grid          /* 2-column form grid */
.form-group         /* Form field wrapper */
.modal-overlay      /* Modal background */
.modal-content      /* Modal container */

/* Badges */
.status-badge       /* Status indicator */
.priority-badge     /* Priority indicator */
.platform-badge     /* Platform indicator */
.shift-badge        /* Shift time indicator */
```

## 📊 State Management Patterns

### Basic State
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Form State
```jsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};
```

### Modal State
```jsx
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const handleEdit = (item) => {
  setSelectedItem(item);
  setShowModal(true);
};
```

## 🔄 API Call Pattern

```jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/endpoint');
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

## 🎯 Common Functions

### Navigate
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dashboard/orders');
```

### Filter Array
```jsx
const filtered = items.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Toggle Boolean
```jsx
setItems(items.map(item =>
  item.id === id ? { ...item, available: !item.available } : item
));
```

### Add Item
```jsx
const newItem = { id: Date.now(), ...formData };
setItems([...items, newItem]);
```

### Delete Item
```jsx
setItems(items.filter(item => item.id !== id));
```

### Update Item
```jsx
setItems(items.map(item =>
  item.id === id ? { ...item, ...updates } : item
));
```

## 🎨 Color Variables

```css
var(--cyan)         /* #00ADB5 - Primary */
var(--orange)       /* #FF5722 - Accent */
var(--white)        /* #FFFFFF */
var(--off-white)    /* #F8F9FA */
var(--text-dark)    /* #1A1A2E */
var(--text-gray)    /* #64748B */
```

## 🔧 Icons (react-icons/fi)

```jsx
import {
  FiHome,         // Home
  FiGrid,         // Orders
  FiBook,         // Menu
  FiUsers,        // Team
  FiBarChart2,    // Analytics
  FiSettings,     // Settings
  FiPlus,         // Add
  FiEdit2,        // Edit
  FiTrash2,       // Delete
  FiSearch,       // Search
  FiX,            // Close
  FiSave,         // Save
  FiClock,        // Time
  FiPackage,      // Package
  FiMail,         // Email
  FiPhone,        // Phone
  FiMapPin,       // Location
  FiTrendingUp,   // Trending Up
  FiTrendingDown, // Trending Down
  FiAlertCircle,  // Alert
  FiToggleLeft,   // Toggle Off
  FiToggleRight   // Toggle On
} from 'react-icons/fi';
```

## 📱 Responsive Utilities

```css
/* Mobile First Approach */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 🚀 Quick Setup Checklist

- [ ] Install dependencies: `npm install react-icons`
- [ ] Copy all files to correct locations
- [ ] Update App.jsx with dashboard routes
- [ ] Update package.json with react-icons
- [ ] Run `npm run dev`
- [ ] Navigate to `/dashboard`
- [ ] Test all routes and features
- [ ] Replace mock data with API calls
- [ ] Add authentication logic
- [ ] Configure API endpoints

## 🔐 Auth Pattern

```jsx
// Protected Route
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Usage
<Route 
  path="/dashboard/*" 
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } 
/>
```

## 💾 LocalStorage Usage

```jsx
// Save
localStorage.setItem('authToken', token);

// Get
const token = localStorage.getItem('authToken');

// Remove
localStorage.removeItem('authToken');

// Clear all
localStorage.clear();
```

## 🎯 Performance Tips

1. **Lazy load routes**:
```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

2. **Memoize expensive calculations**:
```jsx
const filtered = useMemo(() => 
  items.filter(item => item.active),
  [items]
);
```

3. **Debounce search**:
```jsx
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Sidebar not showing | Check Dashboard.css import |
| Icons not rendering | Install react-icons |
| Routes not working | Add wildcard to dashboard route |
| Styles not applying | Check CSS file path |
| Drag-drop not working | Verify event handlers |

## 📚 File Locations

```
src/
├── components/dashboard/Sidebar.jsx
├── pages/
│   ├── Dashboard.jsx
│   └── dashboard/
│       ├── DashboardHome.jsx
│       ├── KanbanBoard.jsx
│       ├── MenuManagement.jsx
│       ├── TeamManagement.jsx
│       ├── Analytics.jsx
│       └── Settings.jsx
└── styles/
    ├── Dashboard.css
    ├── Sidebar.css
    ├── DashboardHome.css
    ├── KanbanBoard.css
    ├── MenuManagement.css
    ├── TeamManagement.css
    ├── Analytics.css
    └── Settings.css
```

---

**Keep this reference handy while developing!** 🚀
