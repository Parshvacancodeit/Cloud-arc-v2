# CloudArc Dashboard - Installation & Setup Guide

## 📦 Quick Setup Instructions

### Step 1: Install Dependencies

First, navigate to your project directory and install the new dependency:

```bash
npm install react-icons
```

Or if you're starting fresh:

```bash
npm install
```

### Step 2: Project Structure

Your project should have the following structure:

```
cloudarc-react/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx (existing)
│   │   ├── Footer.jsx (existing)
│   │   └── dashboard/
│   │       └── Sidebar.jsx (NEW)
│   ├── pages/
│   │   ├── Home.jsx (existing)
│   │   ├── Login.jsx (existing)
│   │   ├── Signup.jsx (existing)
│   │   ├── Dashboard.jsx (NEW)
│   │   └── dashboard/
│   │       ├── DashboardHome.jsx (NEW)
│   │       ├── KanbanBoard.jsx (NEW)
│   │       ├── MenuManagement.jsx (NEW)
│   │       ├── TeamManagement.jsx (NEW)
│   │       ├── Analytics.jsx (NEW)
│   │       └── Settings.jsx (NEW)
│   ├── styles/
│   │   ├── global.css (existing)
│   │   ├── Dashboard.css (NEW)
│   │   ├── Sidebar.css (NEW)
│   │   ├── DashboardHome.css (NEW)
│   │   ├── KanbanBoard.css (NEW)
│   │   ├── MenuManagement.css (NEW)
│   │   ├── TeamManagement.css (NEW)
│   │   ├── Analytics.css (NEW)
│   │   └── Settings.css (NEW)
│   ├── App.jsx (UPDATED)
│   └── main.jsx (existing)
```

### Step 3: Copy Files

1. **Copy all files from the `dashboard-files` folder:**
   - Pages go to `src/pages/` and `src/pages/dashboard/`
   - Components go to `src/components/dashboard/`
   - Styles go to `src/styles/`

2. **Replace App.jsx** with the updated version

3. **Replace package.json** with the updated version

### Step 4: Run the Application

```bash
npm run dev
```

The app should now be running at `http://localhost:3000`

## 🚀 Features Implemented

### 1. **Dashboard Overview**
- Real-time statistics cards
- Interactive quick action cards
- Recent orders feed
- Alert notifications
- Responsive grid layout

### 2. **Kanban Order Management**
- Drag-and-drop functionality
- 4-stage workflow (Received → Preparing → Ready → Dispatched)
- Order filtering and search
- Detailed order modals
- Platform badges
- Priority indicators
- Real-time time tracking

### 3. **Menu Management**
- Interactive menu cards with images
- Add/Edit/Delete functionality
- Category filtering
- Availability toggle
- Platform sync indicators
- Vegetarian/Non-veg badges
- Bestseller marking
- Prep time tracking

### 4. **Team Management**
- Staff member cards
- Role-based filtering
- Permission management
- Shift scheduling
- Contact information
- Station assignments
- Add/Edit/Remove members

### 5. **Analytics Dashboard**
- Revenue tracking
- Order metrics
- Hourly order chart
- Platform distribution
- Top selling items
- Performance metrics
- Time range filtering
- Interactive visualizations

### 6. **Settings**
- Profile management
- Business settings
- Notification preferences
- Platform integrations
- Operating hours
- Security settings
- Tabbed interface

### 7. **Sidebar Navigation**
- Collapsible sidebar
- Active route highlighting
- Smooth transitions
- Responsive behavior
- Sticky positioning

## 🎨 Design System

### Colors
- **Primary (Cyan)**: `#00ADB5`
- **Accent (Orange)**: `#FF5722`
- **Background**: `#FFFFFF` / `#F8F9FA`
- **Text Dark**: `#1A1A2E`
- **Text Gray**: `#64748B`

### Typography
- **Headers**: Space Grotesk (500, 600, 700)
- **Body**: Manrope (400, 500, 600, 700, 800)

### Components
- Border radius: 8px-16px
- Shadows: Subtle, layered
- Transitions: 0.3s ease
- Hover effects: translateY + box-shadow

## 🔄 Routing Structure

```
/ (Home/Landing)
/login (Login Page)
/signup (Registration)
/dashboard (Dashboard Container)
  ├── / (Dashboard Home/Overview)
  ├── /orders (Kanban Board)
  ├── /menu (Menu Management)
  ├── /team (Team Management)
  ├── /analytics (Analytics)
  └── /settings (Settings)
```

## 🔐 Authentication Flow

Currently using localStorage for demo purposes:

```javascript
// After successful login
localStorage.setItem('authToken', token);

// Logout
localStorage.removeItem('authToken');
window.location.href = '/login';
```

**TO IMPLEMENT**: Replace with your Flask API authentication endpoints.

## 📡 API Integration Points

### Login (Login.jsx)
```javascript
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, remember })
})
```

### Signup (Signup.jsx)
```javascript
fetch('/api/v1/onboarding/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

### Dashboard Data Endpoints (TO IMPLEMENT)

```javascript
// Dashboard Overview
GET /api/v1/dashboard/stats

// Orders
GET /api/v1/orders
POST /api/v1/orders
PUT /api/v1/orders/:id
DELETE /api/v1/orders/:id

// Menu
GET /api/v1/menu
POST /api/v1/menu
PUT /api/v1/menu/:id
DELETE /api/v1/menu/:id

// Team
GET /api/v1/team
POST /api/v1/team
PUT /api/v1/team/:id
DELETE /api/v1/team/:id

// Analytics
GET /api/v1/analytics?range=week

// Settings
GET /api/v1/settings
PUT /api/v1/settings
```

## 🛠️ Customization Guide

### Adding New Dashboard Sections

1. **Create the component**:
```bash
touch src/pages/dashboard/NewSection.jsx
touch src/styles/NewSection.css
```

2. **Add route in Dashboard.jsx**:
```jsx
<Route path="/newsection" element={<NewSection />} />
```

3. **Add to Sidebar.jsx**:
```jsx
{ path: '/dashboard/newsection', icon: FiIcon, label: 'New Section' }
```

### Modifying Mock Data

All mock data is currently hardcoded in components. Replace with API calls:

```javascript
// Current (mock data)
const [orders, setOrders] = useState(mockOrders);

// Replace with
useEffect(() => {
  fetch('/api/v1/orders')
    .then(res => res.json())
    .then(data => setOrders(data));
}, []);
```

### Styling Modifications

All styles use CSS variables from `global.css`:

```css
/* Modify colors globally */
:root {
  --cyan: #00ADB5;      /* Change to your primary */
  --orange: #FF5722;    /* Change to your accent */
}
```

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (default)
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

All components are fully responsive with:
- Grid → Stack transitions
- Sidebar → Mobile menu
- Touch-friendly buttons
- Optimized spacing

## 🔍 Key Features to Note

### Drag and Drop (Kanban)
Uses native HTML5 drag and drop API:
- `onDragStart`, `onDragOver`, `onDrop`
- Visual feedback during drag
- Prevents invalid drops

### State Management
Currently using React useState:
- Component-level state
- Props passing
- **Recommended**: Add Context API or Redux for production

### Form Validation
Real-time validation on:
- Email format
- Password strength
- Required fields
- Custom business rules

### Animations
Smooth transitions using:
- CSS transitions
- Transform properties
- Intersection Observer (scroll animations)
- Keyframe animations

## 🐛 Troubleshooting

### Issue: "Module not found: react-icons"
**Solution**: 
```bash
npm install react-icons
```

### Issue: Dashboard not routing
**Solution**: Check that App.jsx has the wildcard route:
```jsx
<Route path="/dashboard/*" element={<Dashboard />} />
```

### Issue: Styles not applying
**Solution**: 
1. Check CSS file imports in components
2. Clear browser cache
3. Verify file paths match structure

### Issue: Sidebar not collapsing on mobile
**Solution**: This is intentional. On mobile, sidebar collapses by default.

## 🚀 Production Deployment

Before deploying:

1. **Replace all mock data with API calls**
2. **Add proper authentication**
3. **Set up environment variables**
4. **Enable error boundaries**
5. **Add loading states**
6. **Implement proper error handling**
7. **Add form validation on backend**
8. **Set up CORS properly**
9. **Optimize images**
10. **Run production build**:

```bash
npm run build
```

## 📚 Next Steps

1. **Connect to Flask API**
   - Update all fetch URLs
   - Handle authentication tokens
   - Add request interceptors

2. **Add Real-time Features**
   - WebSocket for live order updates
   - Push notifications
   - Live analytics refresh

3. **Enhance Security**
   - JWT token handling
   - Protected routes
   - Role-based access control
   - Input sanitization

4. **Performance Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Caching strategy

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## 💡 Tips for Indian Cloud Kitchen Context

The application is designed with Indian cloud kitchens in mind:

1. **Currency**: All prices shown in ₹ (INR)
2. **Platforms**: Integrated with Zomato, Swiggy, Uber Eats
3. **Veg/Non-veg**: Food type indicators
4. **FSSAI**: License number field
5. **GST**: Business tax number field
6. **Phone format**: Indian mobile numbers (+91)
7. **Operating hours**: Flexible timing for different shifts
8. **Multi-brand**: Support for virtual brands

## 📞 Support

For any issues or questions:
1. Check the README.md
2. Review COMPONENTS.md for detailed component docs
3. See QUICK-REFERENCE.md for quick snippets
4. Contact your development team

---

**Built with ❤️ for CloudArc - Cloud Kitchen POS System**
