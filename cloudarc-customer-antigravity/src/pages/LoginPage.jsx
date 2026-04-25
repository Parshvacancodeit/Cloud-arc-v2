import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../services/api';

const LoginPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      const res = await customerApi.login(form.email, form.password);
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
      <div className="hero-heading">Welcome<br/><span>back!</span></div>
      <div style={{ marginTop: 24 }}>
        {error && <div style={{ color: '#EF4444', marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-field" style={{ padding: 0 }}>
          <label>Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="rahul@example.com" />
        </div>
        <div className="form-field" style={{ padding: 0 }}>
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
        </div>
        <button className="primary-btn" style={{ margin: '24px 0 0', width: '100%' }} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login Now'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#94A3B8' }}>
          Don't have an account?{' '}
          <span style={{ color: '#00ADB5', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('register', {})}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
