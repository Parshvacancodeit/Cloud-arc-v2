# CloudArc - Cloud Kitchen POS System

A modern React-based Point-of-Sale system designed specifically for cloud kitchens, featuring real-time order tracking, multi-brand management, and seamless platform integration.

## 🚀 Features

- **Real-Time Order Tracking**: Kanban-style order management with live updates
- **Multi-Brand Support**: Manage multiple virtual brands from one dashboard
- **Platform Integration**: Connect with Zomato, Swiggy, Uber Eats, and more
- **Menu Management**: Centralized control over menus across all platforms
- **Analytics Dashboard**: Track performance, preparation times, and bottlenecks
- **Team Management**: Role-based access and shift management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 📁 Project Structure

```
cloudarc-react/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page
│   │   ├── Login.jsx       # Login page
│   │   └── Signup.jsx      # Multi-step registration
│   ├── styles/             # CSS modules
│   │   ├── global.css      # Global styles and CSS variables
│   │   ├── Navbar.css
│   │   ├── Footer.css
│   │   ├── Home.css
│   │   ├── Login.css
│   │   └── Signup.css
│   ├── utils/              # Utility functions (to be added)
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # Application entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Design System

### Color Palette
```css
--cyan: #00ADB5      /* Primary brand color */
--orange: #FF5722    /* Accent/CTA color */
--white: #FFFFFF     /* Background */
--off-white: #F8F9FA /* Secondary background */
--text-dark: #1A1A2E /* Primary text */
--text-gray: #64748B /* Secondary text */
```

### Typography
- **Headers**: Space Grotesk (500, 600, 700)
- **Body**: Manrope (400, 500, 600, 700, 800)

## 🛠️ Tech Stack

- **React**: 18.2.0
- **React Router DOM**: 6.20.0 (for routing)
- **Vite**: 4.5.0 (build tool)
- **CSS**: Custom CSS with CSS variables

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cloudarc-react
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 Routes

- `/` - Home/Landing page
- `/login` - User login
- `/signup` - Multi-step user registration
- `/dashboard` - Main dashboard (to be implemented)

## 🔄 Integration with Backend

The application is designed to integrate with a Flask API. Update the API endpoints in the respective components:

### Login (`src/pages/Login.jsx`)
```javascript
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, remember })
})
```

### Signup (`src/pages/Signup.jsx`)
```javascript
fetch('/api/v1/onboarding/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

## 🎯 Key Components

### Navbar Component
- Responsive navigation
- Two variants: `home` (with menu) and `auth` (back link only)
- Smooth scroll to sections

### Footer Component
- Company information
- Quick links
- Social media links

### Home Page
- Hero section with animated food images
- Live order tracking demo
- Why CloudArc section
- Features grid
- Platform integrations carousel

### Login Page
- Split-screen design
- Form validation
- Password visibility toggle
- Social login (Google)
- "Remember me" functionality

### Signup Page
- Multi-step form (3 steps)
- Progress indicator
- Step-specific visuals
- Real-time validation
- Radio button selections

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🎨 Animation Features

- Scroll-triggered animations (fade-in, slide-in)
- Smooth page transitions
- Hover effects on cards and buttons
- Loading states
- Form validation feedback

## 🔐 Authentication Flow

1. User visits `/signup`
2. Completes 3-step registration:
   - Step 1: Email & Password
   - Step 2: Kitchen Information
   - Step 3: Operational Scale
3. Form submits to `/api/v1/onboarding/register`
4. User redirected to dashboard upon success

## 🚧 Future Enhancements

- Dashboard implementation
- Order management system
- Menu management interface
- Analytics and reporting
- Team management
- Platform integrations (Zomato, Swiggy APIs)
- Real-time WebSocket connections
- Payment gateway integration

## 👥 Team

This is a final year project with team members working on:
- **Frontend**: React.js (this repository)
- **Backend**: Flask API
- **Database**: PostgreSQL

## 📄 License

This project is part of an academic final year project.

## 🤝 Contributing

This is an academic project. For any suggestions or improvements, please contact the team members.

## 📞 Support

For any queries or issues, please reach out to the development team.

---

Built with ❤️ by the CloudArc Team
