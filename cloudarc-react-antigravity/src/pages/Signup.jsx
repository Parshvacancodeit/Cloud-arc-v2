import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';
import '../styles/Signup.css';

const CUISINE_OPTIONS = ['Indian', 'Chinese', 'Italian', 'Fast Food', 'Continental', 'South Indian', 'North Indian', 'Thai', 'Mexican', 'Desserts'];

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1 — Account
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2 — Kitchen Info
    kitchenName: '',
    businessType: '',
    ownerName: '',
    phone: '',
    city: '',
    pincode: '',           // ← REQUIRED: used by customer app to find this restaurant
    cuisineTypes: [],      // ← REQUIRED: customer app filter
    openingTime: '09:00',
    closingTime: '23:00',
    // Step 3 — Scale
    dailyOrders: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const toggleCuisine = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    if (step === 2) {
      if (!formData.kitchenName.trim()) newErrors.kitchenName = 'Please enter your kitchen name';
      if (!formData.businessType) newErrors.businessType = 'Please select a business type';
      if (!formData.city.trim()) newErrors.city = 'Please enter your city';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required for customer app discovery';
      if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.cuisineTypes.length === 0) newErrors.cuisineTypes = 'Select at least one cuisine type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep) && currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.ownerName || formData.kitchenName,
        kitchen_name: formData.kitchenName,
        business_type: formData.businessType,
        city: formData.city,
        pincode: formData.pincode,
        cuisine_types: formData.cuisineTypes,
        phone: formData.phone,
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        daily_order_capacity: formData.dailyOrders || '10-30',
      };

      const data = await authApi.register(payload);

      localStorage.setItem('token', data.token);
      localStorage.setItem('restaurant_id', data.restaurant_id);
      localStorage.setItem('user_name', data.user?.name || '');
      localStorage.setItem('kitchen_name', data.restaurant?.name || formData.kitchenName);

      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const visualContent = {
    1: { image: "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800", title: 'Welcome to CloudArc', description: 'Join 500+ cloud kitchens streamlining their operations with real-time order tracking.', features: ['Free Trial', 'No Credit Card'] },
    2: { image: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800", title: 'Your Kitchen, Your Way', description: 'Your pincode lets customers on our app discover your restaurant instantly.', features: ['Customer Discovery', 'Live Updates'] },
    3: { image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800", title: 'Almost There!', description: 'Help us tailor CloudArc to your kitchen scale. You can always change this later.', features: ['Analytics Dashboard', 'Performance Insights'] },
  };
  const cv = visualContent[currentStep];

  return (
    <div>
      <Navbar variant="auth" />
      <div className="onboarding-container">
        {/* FORM SECTION */}
        <div className="form-section">
          <div className="form-wrapper">
            <div className="progress-container">
              <div className="step-indicator">
                {[1, 2, 3].map(step => (
                  <div key={step} className={`step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}></div>
                ))}
              </div>
              <div className="step-info">
                <span className="step-number">Step {currentStep} of {totalSteps}</span>
              </div>
            </div>

            {apiError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px' }}>
                ⚠ {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* STEP 1 */}
              <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                <h2 className="step-title">Create Account</h2>
                <p className="step-description">Set up your login credentials</p>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required />
                  {errors.email && <span className="error-message show">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Minimum 8 characters" value={formData.password} onChange={handleInputChange} required />
                  {errors.password && <span className="error-message show">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="confirmPassword" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleInputChange} required />
                  {errors.confirmPassword && <span className="error-message show">{errors.confirmPassword}</span>}
                </div>

                <div className="button-group">
                  <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                  Already have an account? <Link to="/login" style={{ color: '#00ADB5' }}>Sign in</Link>
                </div>
              </div>

              {/* STEP 2 */}
              <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                <h2 className="step-title">Kitchen Details</h2>
                <p className="step-description">Tell us about your restaurant</p>

                <div className="form-group">
                  <label className="form-label">Kitchen / Brand Name *</label>
                  <input type="text" name="kitchenName" className={`form-input ${errors.kitchenName ? 'error' : ''}`} placeholder="e.g., Spice Garden Kitchen" value={formData.kitchenName} onChange={handleInputChange} required />
                  {errors.kitchenName && <span className="error-message show">{errors.kitchenName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <input type="text" name="ownerName" className="form-input" placeholder="Your full name" value={formData.ownerName} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" name="phone" className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                  {errors.phone && <span className="error-message show">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Business Type *</label>
                  <div className="radio-group">
                    {[['cloud-kitchen', 'Cloud Kitchen', 'Delivery-only operations'], ['restaurant-delivery', 'Restaurant + Delivery', 'Dine-in with delivery services']].map(([val, title, desc]) => (
                      <label key={val} className="radio-option">
                        <input type="radio" name="businessType" value={val} checked={formData.businessType === val} onChange={handleInputChange} />
                        <span className="radio-custom"></span>
                        <span className="radio-label"><div className="radio-title">{title}</div><div className="radio-helper">{desc}</div></span>
                      </label>
                    ))}
                  </div>
                  {errors.businessType && <span className="error-message show">{errors.businessType}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" name="city" className={`form-input ${errors.city ? 'error' : ''}`} placeholder="e.g., Mumbai, Delhi" value={formData.city} onChange={handleInputChange} required />
                  {errors.city && <span className="error-message show">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode * <span style={{ fontSize: '11px', color: '#00ADB5', fontWeight: 400 }}>— Customers find you via pincode</span></label>
                  <input type="text" name="pincode" className={`form-input ${errors.pincode ? 'error' : ''}`} placeholder="6-digit pincode" maxLength={6} value={formData.pincode} onChange={handleInputChange} required />
                  {errors.pincode && <span className="error-message show">{errors.pincode}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Cuisine Types * <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>Select all that apply</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {CUISINE_OPTIONS.map(cuisine => (
                      <button type="button" key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        style={{
                          padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', border: '1.5px solid',
                          borderColor: formData.cuisineTypes.includes(cuisine) ? '#00ADB5' : '#E2E8F0',
                          background: formData.cuisineTypes.includes(cuisine) ? '#E6F8F9' : 'white',
                          color: formData.cuisineTypes.includes(cuisine) ? '#00ADB5' : '#64748B',
                          fontWeight: formData.cuisineTypes.includes(cuisine) ? '600' : '400',
                        }}
                      >{cuisine}</button>
                    ))}
                  </div>
                  {errors.cuisineTypes && <span className="error-message show">{errors.cuisineTypes}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Opening Time</label>
                    <input type="time" name="openingTime" className="form-input" value={formData.openingTime} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Closing Time</label>
                    <input type="time" name="closingTime" className="form-input" value={formData.closingTime} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="button-group">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
                </div>
              </div>

              {/* STEP 3 */}
              <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
                <h2 className="step-title">Operational Scale</h2>
                <p className="step-description">Help us understand your kitchen size</p>

                <div className="form-group">
                  <label className="form-label">Approximate Daily Orders</label>
                  <div className="radio-group">
                    {[['0-10', '0–10 orders', 'Just getting started'], ['10-30', '10–30 orders', 'Growing operation'], ['30-100', '30–100 orders', 'Established kitchen'], ['100+', '100+ orders', 'High-volume operation']].map(([val, title, desc]) => (
                      <label key={val} className="radio-option">
                        <input type="radio" name="dailyOrders" value={val} checked={formData.dailyOrders === val} onChange={handleInputChange} />
                        <span className="radio-custom"></span>
                        <span className="radio-label"><div className="radio-title">{title}</div><div className="radio-helper">{desc}</div></span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="button-group">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn btn-submit" disabled={loading}>
                    {loading ? 'Setting up...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* VISUAL SECTION */}
        <div className="visual-section">
          <div className="bg-element bg-element-1"></div>
          <div className="bg-element bg-element-2"></div>
          <div className="visual-content">
            <div className="visual-step active">
              <div className="hero-image-container">
                <div className="hero-image">
                  <img src={cv.image} alt="Food" />
                </div>
              </div>
              <h3 className="visual-title">{cv.title}</h3>
              <p className="visual-description">{cv.description}</p>
              <div className="visual-features">
                {cv.features.map((f, i) => (
                  <div key={i} className="feature-pill">
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
      </div>
    </div>
  );
};

export default Signup;
