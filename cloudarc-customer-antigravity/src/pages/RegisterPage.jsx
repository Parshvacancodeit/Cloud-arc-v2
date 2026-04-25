import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../services/api';

const RegisterPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    try {
      const res = await customerApi.register(form);
      login(res.customer, res.token);
      onNavigate('home', {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px' }}>
      <div className="hero-heading">Create<br/><span>Account</span></div>
      <div style={{ marginTop: 24 }}>
        {error && <div style={{ color: '#EF4444', marginBottom: 16, fontSize: 13 }}>{error}</div>}
        {[
          ['name', 'Full Name', 'text', 'Rahul Sharma'],
          ['email', 'Email Address', 'email', 'rahul@example.com'],
          ['password', 'Password', 'password', 'Min 6 characters'],
          ['phone', 'Phone Number', 'tel', '9876543210'],
          ['address', 'Delivery Address', 'text', 'Flat, Street, Area...'],
        ].map(([field, label, type, placeholder]) => (
          <div key={field} className="form-field" style={{ padding: 0 }}>
            <label>{label}</label>
            <input type={type} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder} />
          </div>
        ))}
        <button className="primary-btn" style={{ margin: '24px 0 0', width: '100%' }} onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#94A3B8' }}>
          Already have an account?{' '}
          <span style={{ color: '#00ADB5', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('login', {})}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
