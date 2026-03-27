import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (apiError) setApiError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    if (name === 'email' && !validateEmail(value)) newErrors.email = 'Please enter a valid email';
    else if (name === 'password' && value.trim() === '') newErrors.password = 'Password is required';
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (formData.password.trim() === '') newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setApiError('');
    try {
      const data = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Store auth data — all subsequent API calls use these
      localStorage.setItem('token', data.token);
      localStorage.setItem('restaurant_id', data.restaurant_id);
      localStorage.setItem('user_name', data.user?.name || '');
      localStorage.setItem('kitchen_name', data.restaurant?.name || '');

      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar variant="auth" />
      <div className="login-container">
        {/* VISUAL SECTION */}
        <div className="visual-section">
          <div className="bg-element bg-element-1"></div>
          <div className="bg-element bg-element-2"></div>
          <div className="bg-element bg-element-3"></div>
          <div className="visual-content">
            <div className="visual-step">
              <div className="hero-image-container">
                <div className="hero-image">
                  <img src="https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Kitchen" />
                  <div className="floating-badge badge-1">
                    <div className="badge-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <div className="badge-text">
                      <div className="badge-title">Real-Time</div>
                      <div className="badge-subtitle">Live order tracking</div>
                    </div>
                  </div>
                  <div className="floating-badge badge-2">
                    <div className="badge-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
                      </svg>
                    </div>
                    <div className="badge-text">
                      <div className="badge-title">All Platforms</div>
                      <div className="badge-subtitle">Zomato, Swiggy & more</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="visual-title">Welcome Back!</h3>
              <p className="visual-description">
                Access your CloudArc dashboard and manage your cloud kitchen operations with real-time order tracking.
              </p>
              <div className="visual-features">
                {['Kanban Board', 'Analytics', 'Multi-Brand'].map(f => (
                  <div key={f} className="feature-pill">
                    <div className="feature-pill-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="form-section">
          <div className="form-wrapper">
            <div className="login-header">
              <h1 className="login-title">Sign In</h1>
              <p className="login-subtitle">Enter your credentials to access your account</p>
            </div>

            {apiError && (
              <div className="error-banner" style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px'
              }}>
                ⚠ {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email" id="email" name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.email && <span className="error-message show">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password" name="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <span className="error-message show">{errors.password}</span>}
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" name="remember" checked={formData.remember} onChange={handleInputChange} />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
