# Component Documentation

## 🧩 Component Overview

### Navbar Component
**Location**: `src/components/Navbar.jsx`  
**Styles**: `src/styles/Navbar.css`

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'home' | Navigation variant: 'home' or 'auth' |

#### Variants
- **home**: Full navigation with menu items (Features, Integrations, Pricing, CTA)
- **auth**: Simplified nav with logo and back link only

#### Usage
```jsx
import Navbar from '../components/Navbar';

// Home variant (default)
<Navbar />

// Auth variant (for login/signup pages)
<Navbar variant="auth" />
```

---

### Footer Component
**Location**: `src/components/Footer.jsx`  
**Styles**: `src/styles/Footer.css`

#### Features
- Company branding
- Quick links (Product, Company, Resources)
- Social media links (Twitter, GitHub, LinkedIn)
- Responsive grid layout

#### Usage
```jsx
import Footer from '../components/Footer';

<Footer />
```

---

## 📄 Page Components

### Home Page
**Location**: `src/pages/Home.jsx`  
**Styles**: `src/styles/Home.css`  
**Route**: `/`

#### Sections
1. **Hero Section**: Animated food images with floating elements
2. **Tracking Section**: Live order tracking Kanban board
3. **Why Section**: Four benefit cards with hover effects
4. **Features Section**: Six feature cards in grid
5. **Integrations Section**: Animated logo carousel

#### Key Features
- Intersection Observer for scroll animations
- Smooth scroll to sections
- Animated food items with floating effect
- Responsive grid layouts

---

### Login Page
**Location**: `src/pages/Login.jsx`  
**Styles**: `src/styles/Login.css`  
**Route**: `/login`

#### Features
- Split-screen layout (form + visual)
- Email and password validation
- Password visibility toggle
- "Remember me" checkbox
- Social login (Google)
- Error state management
- Success message

#### State Management
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  remember: false
});
const [errors, setErrors] = useState({});
const [showPassword, setShowPassword] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
```

#### Validation
- Email: Regex validation
- Password: Required field check
- Real-time validation on blur
- Clear errors on input

#### API Integration Point
```javascript
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, remember })
})
```

---

### Signup Page
**Location**: `src/pages/Signup.jsx`  
**Styles**: `src/styles/Signup.css`  
**Route**: `/signup`

#### Features
- Multi-step form (3 steps)
- Progress indicator
- Step-specific visual content
- Form validation per step
- Radio button selections
- Dynamic visual content based on current step

#### Steps

**Step 1: Account Creation**
- Email (with validation)
- Password (min 8 characters)
- Confirm Password (must match)

**Step 2: Kitchen Information**
- Kitchen/Brand Name
- Business Type (Cloud Kitchen / Restaurant + Delivery)
- City

**Step 3: Operational Scale**
- Daily Orders (0-10 / 10-30 / 30+)

#### State Management
```javascript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  kitchenName: '',
  businessType: '',
  city: '',
  dailyOrders: ''
});
const [errors, setErrors] = useState({});
```

#### Navigation Functions
```javascript
nextStep()    // Validates current step, moves to next
prevStep()    // Returns to previous step
handleSubmit() // Final submission
```

#### Visual Content
Each step has unique visual content:
- Different hero images
- Different floating badges
- Different feature pills
- Different descriptions

#### API Integration Point
```javascript
fetch('/api/v1/onboarding/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

---

## 🎨 Styling Conventions

### CSS Organization
Each component/page has its own CSS file:
```
Component.jsx → Component.css
Page.jsx → Page.css
```

### CSS Variables
Defined in `src/styles/global.css`:
```css
--cyan: #00ADB5;      /* Primary */
--orange: #FF5722;    /* Accent */
--white: #FFFFFF;
--off-white: #F8F9FA;
--text-dark: #1A1A2E;
--text-gray: #64748B;
```

### Common Class Patterns

#### Layout
- `.container`: Max-width 1400px, centered
- `.section`: Padding 8rem vertical
- `.grid`: Display grid layouts

#### Buttons
- `.btn`: Base button styles
- `.btn-primary`: Cyan background
- `.btn-secondary`: Off-white background
- `.btn-submit`: Orange background

#### Forms
- `.form-group`: Form field container
- `.form-label`: Field labels
- `.form-input`: Input fields
- `.error`: Error state
- `.error-message`: Error text

#### Animations
- `.scroll-fade-in`: Fade in on scroll
- `.scroll-slide-left`: Slide from left
- `.scroll-slide-right`: Slide from right

---

## 🔄 Common Patterns

### Form Handling
```jsx
const [formData, setFormData] = useState({ field: '' });

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
};

<input
  name="field"
  value={formData.field}
  onChange={handleInputChange}
/>
```

### Error Handling
```jsx
const [errors, setErrors] = useState({});

// Set error
setErrors({ ...errors, field: 'Error message' });

// Clear error
if (errors.field) {
  setErrors({ ...errors, field: '' });
}

// Display error
{errors.field && (
  <span className="error-message show">{errors.field}</span>
)}
```

### Navigation
```jsx
import { Link, useNavigate } from 'react-router-dom';

// Using Link
<Link to="/dashboard">Dashboard</Link>

// Using navigate
const navigate = useNavigate();
navigate('/dashboard');
```

---

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px  
- **Mobile**: < 768px

### Media Query Pattern
```css
/* Desktop first */
.element {
  /* Desktop styles */
}

@media (max-width: 1024px) {
  .element {
    /* Tablet styles */
  }
}

@media (max-width: 768px) {
  .element {
    /* Mobile styles */
  }
}
```

---

## 🔧 Utilities

### Scroll Animation Observer
Used in Home.jsx:
```javascript
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

  document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right')
    .forEach(el => observer.observe(el));

  return () => observer.disconnect();
}, []);
```

### Email Validation
```javascript
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

---

## 🎯 Best Practices

### Component Structure
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ComponentName from '../components/ComponentName';
import '../styles/PageName.css';

const PageName = () => {
  // State
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Handlers
  const handleAction = () => {
    // Logic
  };

  // Render
  return (
    <div className="page-name">
      {/* JSX */}
    </div>
  );
};

export default PageName;
```

### Props Destructuring
```jsx
// Good
const Component = ({ title, description }) => {
  return <div>{title}</div>;
};

// Avoid
const Component = (props) => {
  return <div>{props.title}</div>;
};
```

### Conditional Rendering
```jsx
// Short circuit
{isLoading && <Loader />}

// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// Multiple conditions
{error && <Error />}
{!error && loading && <Loader />}
{!error && !loading && <Content />}
```

---

## 🐛 Debugging Tips

### Common Issues

**Component not rendering**
- Check import path
- Verify export/import syntax
- Check JSX syntax

**Styles not applying**
- Verify CSS file is imported
- Check class name spelling
- Inspect element in DevTools

**State not updating**
- Check if using setState correctly
- Verify not mutating state directly
- Check useEffect dependencies

**Route not working**
- Verify route is defined in App.jsx
- Check path spelling
- Ensure React Router is installed

---

## 📝 Adding New Features

### Checklist
1. ☐ Create component/page file
2. ☐ Create corresponding CSS file
3. ☐ Import necessary dependencies
4. ☐ Define component structure
5. ☐ Add styles
6. ☐ Test responsiveness
7. ☐ Add to routing (if page)
8. ☐ Update documentation
9. ☐ Test functionality
10. ☐ Commit changes

---

This documentation should help you understand and work with the CloudArc React application components effectively!
