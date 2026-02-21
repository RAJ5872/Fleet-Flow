import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const ROLES = ['manager', 'dispatcher', 'safetyOfficer', 'finance'];

export default function LoginPage() {
    const { login } = useAuth();
    const { toast } = useToast();

    // Tab: 'login' | 'register'
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Login form
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    // Register form
    const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'dispatcher' });

    /* ── Login ── */
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(loginForm.email, loginForm.password);
        if (!result.success) toast(result.message, 'error');
        setLoading(false);
    };



    /* ── Register ── */
    const handleRegister = async (e) => {
        e.preventDefault();
        if (regForm.password !== regForm.confirmPassword) {
            toast('Passwords do not match', 'error');
            return;
        }
        if (regForm.password.length < 6) {
            toast('Password must be at least 6 characters', 'error');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register', {
                name: regForm.name,
                email: regForm.email,
                password: regForm.password,
                role: regForm.role,
            });
            toast(`Account created! You can now log in as ${regForm.role}. 🎉`, 'success');
            // Pre-fill login form and switch tab
            setLoginForm({ email: regForm.email, password: regForm.password });
            setRegForm({ name: '', email: '', password: '', confirmPassword: '', role: 'dispatcher' });
            setTab('login');
        } catch (err) {
            toast(err.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    /* ── Styles ── */
    const tabStyle = (active) => ({
        flex: 1,
        padding: '10px',
        background: active ? 'var(--blue)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    });

    return (
        <div className="login-page">
            <div className="login-card" style={{ maxWidth: 440 }}>
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">🚛</div>
                    <div>
                        <h2 style={{
                            fontSize: '1.3rem', fontWeight: 800,
                            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>FleetFlow</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fleet & Logistics Management</p>
                    </div>
                </div>

                {/* Tab switcher */}
                <div style={{
                    display: 'flex', gap: '4px', background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '24px',
                    border: '1px solid var(--border)',
                }}>
                    <button style={tabStyle(tab === 'login')} onClick={() => setTab('login')}>Sign In</button>
                    <button style={tabStyle(tab === 'register')} onClick={() => setTab('register')}>Create Account</button>
                </div>

                {/* ── LOGIN FORM ── */}
                {tab === 'login' && (
                    <>
                        <h3 style={{ marginBottom: '4px' }}>Welcome back</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Sign in to access your dashboard
                        </p>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label>Email address</label>
                                <input
                                    type="email" required autoComplete="email"
                                    placeholder="you@fleetflow.com"
                                    value={loginForm.email}
                                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'} required
                                        placeholder="••••••••"
                                        value={loginForm.password}
                                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                        style={{ paddingRight: '44px' }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                                        }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}
                                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>



                        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            New to FleetFlow?{' '}
                            <button onClick={() => setTab('register')}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer',
                                    fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit'
                                }}>
                                Create an account
                            </button>
                        </p>
                    </>
                )}

                {/* ── REGISTER FORM ── */}
                {tab === 'register' && (
                    <>
                        <h3 style={{ marginBottom: '4px' }}>Create your account</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Join FleetFlow and select your role
                        </p>

                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    required placeholder="e.g. Jane Doe"
                                    value={regForm.name}
                                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email address</label>
                                <input
                                    type="email" required placeholder="you@example.com"
                                    value={regForm.email}
                                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <select value={regForm.role} onChange={e => setRegForm({ ...regForm, role: e.target.value })}>
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                    ))}
                                </select>

                                {/* Role description hint */}
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {{
                                        manager: '👔 Full access – manage fleet, trips, and users',
                                        dispatcher: '📡 Create and dispatch trips',
                                        safetyOfficer: '🛡️ Manage driver safety scores and maintenance logs',
                                        finance: '💰 View and record expenses and costs',
                                    }[regForm.role]}
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'} required minLength={6}
                                        placeholder="Min. 6 characters"
                                        value={regForm.password}
                                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                                        style={{ paddingRight: '44px' }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                                        }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password" required
                                    placeholder="Re-enter password"
                                    value={regForm.confirmPassword}
                                    onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                                    style={{ borderColor: regForm.confirmPassword && regForm.password !== regForm.confirmPassword ? 'var(--red)' : undefined }}
                                />
                                {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '3px' }}>Passwords do not match</p>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}
                                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px' }}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Already have an account?{' '}
                            <button onClick={() => setTab('login')}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer',
                                    fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit'
                                }}>
                                Sign in
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
