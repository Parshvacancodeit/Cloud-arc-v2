import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ variant = 'home' }) => {
  const navigate = useNavigate();

  if (variant === 'auth') {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">CloudArc</Link>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">CloudArc</Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#integrations">Integrations</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><Link to="/signup" className="nav-cta">Request Demo</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
