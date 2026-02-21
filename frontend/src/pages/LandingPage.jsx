import { useNavigate } from 'react-router-dom';
import {
    Truck, Users, Route, BarChart3, Wrench, Shield,
    ArrowRight, MapPin, Globe, TrendingUp, ChevronRight,
} from 'lucide-react';

const FEATURES = [
    {
        icon: Truck,
        color: '#4f8ef7',
        bg: 'rgba(79,142,247,0.08)',
        border: 'rgba(79,142,247,0.18)',
        title: 'Real-Time Fleet Monitoring',
        desc: 'Track every vehicle live on the map. Know status, location, and health of your entire fleet at a glance.',
    },
    {
        icon: Route,
        color: '#34d399',
        bg: 'rgba(52,211,153,0.08)',
        border: 'rgba(52,211,153,0.18)',
        title: 'Smart Trip Management',
        desc: 'Create, dispatch, and complete trips with location autocomplete. Full route visibility from origin to destination.',
    },
    {
        icon: Shield,
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.08)',
        border: 'rgba(251,191,36,0.18)',
        title: 'Driver Safety & Compliance',
        desc: 'Safety scores, license expiry alerts, and instant driver contact for real-time on-road coordination.',
    },
    {
        icon: BarChart3,
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
        border: 'rgba(139,92,246,0.18)',
        title: 'Cost Analytics & Reports',
        desc: 'Interactive charts for fuel costs, maintenance spend, and fleet-wide operational efficiency trends.',
    },
    {
        icon: Wrench,
        color: '#f87171',
        bg: 'rgba(248,113,113,0.08)',
        border: 'rgba(248,113,113,0.18)',
        title: 'Maintenance Scheduling',
        desc: 'Log service records, track repair costs, and prevent vehicle downtime before it impacts operations.',
    },
    {
        icon: TrendingUp,
        color: '#38bdf8',
        bg: 'rgba(56,189,248,0.08)',
        border: 'rgba(56,189,248,0.18)',
        title: 'Fuel Efficiency Insights',
        desc: 'Calculate km/L per vehicle, compare consumption across the fleet, and reduce operational costs.',
    },
];

const ROLES = [
    { role: 'Manager', color: '#4f8ef7', emoji: '👔', cap: 'Full system oversight & reports' },
    { role: 'Dispatcher', color: '#34d399', emoji: '📡', cap: 'Create & manage daily operations' },
    { role: 'Safety Officer', color: '#fbbf24', emoji: '🛡️', cap: 'Compliance, scores & safety logs' },
    { role: 'Finance', color: '#8b5cf6', emoji: '📊', cap: 'Cost reports & expense analytics' },
];

const STATS = [
    { value: '6+', label: 'Vehicle Types', icon: Truck },
    { value: '100%', label: 'Route Coverage', icon: MapPin },
    { value: '4', label: 'User Roles', icon: Users },
    { value: 'Live', label: 'Trip Tracking', icon: Globe },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#07091a',
            color: '#eef2ff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            overflowX: 'hidden',
        }}>
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        @keyframes dot-pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .btn-get-started {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-get-started:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 36px rgba(79,142,247,0.6) !important;
        }
        .btn-login {
          transition: background 0.2s, transform 0.2s;
        }
        .btn-login:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateY(-2px);
        }
        .feat-card {
          transition: border-color 0.2s, transform 0.22s, box-shadow 0.22s;
        }
        .feat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4) !important;
        }
        .nav-link {
          transition: color 0.15s;
        }
        .nav-link:hover { color: #eef2ff !important; }
      `}</style>

            {/* ──────────── NAVBAR ──────────── */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
                height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 48px',
                background: 'rgba(7,9,26,0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, boxShadow: '0 0 18px rgba(79,142,247,0.4)',
                    }}>🚛</div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                        Fleet<span style={{ color: '#4f8ef7' }}>Flow</span>
                    </span>
                </div>

                {/* Nav actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button className="btn-login nav-link" onClick={() => navigate('/login')} style={{
                        padding: '8px 22px', borderRadius: 8,
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        Login
                    </button>
                    <button className="btn-get-started" onClick={() => navigate('/login')} style={{
                        padding: '8px 22px', borderRadius: 8,
                        background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                        border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 16px rgba(79,142,247,0.35)',
                    }}>
                        Get Started <ChevronRight size={14} />
                    </button>
                </div>
            </header>

            {/* ──────────── HERO ──────────── */}
            <section style={{
                paddingTop: 170, paddingBottom: 100,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
                padding: '170px 24px 100px',
                background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,142,247,0.14) 0%, transparent 65%)',
                animation: 'fadeUp 0.65s ease',
            }}>
                {/* Live indicator */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 16px', borderRadius: 99, marginBottom: 28,
                    background: 'rgba(52,211,153,0.07)',
                    border: '1px solid rgba(52,211,153,0.22)',
                    fontSize: '0.76rem', fontWeight: 700, color: '#34d399',
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#34d399',
                        display: 'inline-block', animation: 'dot-pulse 2s ease infinite',
                    }} />
                    Fleet Intelligence Platform · Designed for Indian Logistics
                </div>

                {/* Headline */}
                <h1 style={{
                    fontSize: 'clamp(2.4rem,6vw,4.4rem)',
                    fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.08,
                    marginBottom: 22, maxWidth: 860,
                }}>
                    Manage Your Entire{' '}
                    <span style={{
                        background: 'linear-gradient(135deg,#4f8ef7 0%,#8b5cf6 50%,#34d399 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Fleet Operations
                    </span>
                    <br />From One Dashboard
                </h1>

                {/* Subheadline */}
                <p style={{
                    fontSize: 'clamp(1rem,2vw,1.18rem)', color: '#64748b',
                    maxWidth: 600, lineHeight: 1.75, marginBottom: 42,
                }}>
                    FleetFlow gives managers, dispatchers, safety officers, and finance teams
                    a unified command centre to monitor vehicles, dispatch trips, and analyse costs — all in real time.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72 }}>
                    <button className="btn-get-started" onClick={() => navigate('/login')} style={{
                        padding: '15px 36px', borderRadius: 10,
                        background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                        border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 24px rgba(79,142,247,0.45)',
                        display: 'flex', alignItems: 'center', gap: 9,
                    }}>
                        Get Started <ArrowRight size={18} />
                    </button>
                    <button className="btn-login" onClick={() => navigate('/login')} style={{
                        padding: '15px 36px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8', fontSize: '1rem', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        Login to Dashboard
                    </button>
                </div>

                {/* Dashboard preview card */}
                <div style={{ animation: 'floatY 5s ease-in-out infinite', width: '100%', maxWidth: 580 }}>
                    <div style={{
                        background: 'linear-gradient(160deg,rgba(17,24,48,0.98),rgba(10,13,30,0.98))',
                        border: '1px solid rgba(79,142,247,0.18)',
                        borderRadius: 20, padding: 24,
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}>
                        {/* Window chrome */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
                            {['#ef4444', '#fbbf24', '#34d399'].map(c => (
                                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
                            ))}
                            <div style={{
                                marginLeft: 10, padding: '3px 12px', borderRadius: 99,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                fontSize: '0.68rem', color: '#334155', fontFamily: 'monospace',
                            }}>
                                fleetflow.app/dashboard
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                            {[
                                { l: 'Vehicles', v: '6', c: '#4f8ef7' },
                                { l: 'En Route', v: '1', c: '#34d399' },
                                { l: 'Completion', v: '75%', c: '#8b5cf6' },
                            ].map(s => (
                                <div key={s.l} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 12, padding: '14px 12px',
                                }}>
                                    <p style={{ fontSize: '0.6rem', color: '#334155', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                                    <p style={{ fontSize: '1.45rem', fontWeight: 900, color: s.c }}>{s.v}</p>
                                </div>
                            ))}
                        </div>

                        {/* Active trip row */}
                        <div style={{
                            background: 'rgba(79,142,247,0.05)',
                            border: '1px solid rgba(79,142,247,0.14)',
                            borderRadius: 12, padding: '13px 16px',
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%', background: '#34d399',
                                boxShadow: '0 0 8px #34d399', flexShrink: 0, animation: 'dot-pulse 1.5s ease infinite',
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.74rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
                                    🚛 Mumbai JNPT Port → Delhi ICD Patparganj
                                </p>
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{
                                        width: '38%', height: '100%', borderRadius: 99,
                                        background: 'linear-gradient(90deg,#4f8ef7,#8b5cf6)',
                                    }} />
                                </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#4f8ef7', fontWeight: 700, flexShrink: 0 }}>38%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ──────────── STATS ──────────── */}
            <section style={{ padding: '0 24px 90px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
                {STATS.map(s => (
                    <div key={s.label} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 28px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <s.icon size={18} color="#4f8ef7" strokeWidth={1.8} />
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#eef2ff' }}>{s.value}</span>
                        <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>{s.label}</span>
                    </div>
                ))}
            </section>

            {/* ──────────── FEATURES ──────────── */}
            <section style={{ padding: '0 24px 100px', maxWidth: 1120, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <p style={{
                        fontSize: '0.73rem', fontWeight: 800, color: '#4f8ef7', letterSpacing: '0.12em',
                        textTransform: 'uppercase', marginBottom: 12
                    }}>Platform Capabilities</p>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem,4vw,2.9rem)', fontWeight: 900,
                        letterSpacing: '-0.025em', marginBottom: 14, lineHeight: 1.15
                    }}>
                        Everything your fleet team needs
                    </h2>
                    <p style={{
                        fontSize: '1rem', color: '#475569', maxWidth: 500,
                        margin: '0 auto', lineHeight: 1.75
                    }}>
                        From dispatch to delivery, FleetFlow manages every step of the logistics lifecycle.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 18,
                }}>
                    {FEATURES.map(f => (
                        <div className="feat-card" key={f.title} style={{
                            background: f.bg,
                            border: `1px solid ${f.border}`,
                            borderRadius: 18, padding: 28,
                            cursor: 'default',
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 13, marginBottom: 18,
                                background: `${f.color}12`,
                                border: `1px solid ${f.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <f.icon size={22} color={f.color} strokeWidth={1.8} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#e2e8f0' }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ──────────── ROLES ──────────── */}
            <section style={{
                padding: '0 24px 100px',
                maxWidth: 1120, margin: '0 auto',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <p style={{
                        fontSize: '0.73rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.12em',
                        textTransform: 'uppercase', marginBottom: 12
                    }}>Role-Based Access</p>
                    <h2 style={{
                        fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 900,
                        letterSpacing: '-0.02em', lineHeight: 1.2
                    }}>
                        Built for every stakeholder
                    </h2>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: 14,
                }}>
                    {ROLES.map(r => (
                        <div key={r.role} style={{
                            background: `${r.color}07`,
                            border: `1px solid ${r.color}20`,
                            borderRadius: 16, padding: '22px 20px',
                        }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{r.emoji}</div>
                            <p style={{ fontWeight: 700, color: r.color, fontSize: '0.92rem', marginBottom: 7 }}>{r.role}</p>
                            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>{r.cap}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ──────────── BOTTOM CTA ──────────── */}
            <section style={{ padding: '0 24px 100px' }}>
                <div style={{
                    maxWidth: 720, margin: '0 auto', textAlign: 'center',
                    padding: '72px 40px',
                    background: 'linear-gradient(160deg,rgba(79,142,247,0.08),rgba(139,92,246,0.06))',
                    border: '1px solid rgba(79,142,247,0.16)',
                    borderRadius: 28,
                    boxShadow: '0 0 80px rgba(79,142,247,0.06)',
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900,
                        letterSpacing: '-0.025em', marginBottom: 16
                    }}>
                        Ready to take command?
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#475569', marginBottom: 36, lineHeight: 1.75 }}>
                        Sign in and start managing your fleet operations in minutes.
                    </p>
                    <button className="btn-get-started" onClick={() => navigate('/login')} style={{
                        padding: '16px 44px', borderRadius: 10,
                        background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                        border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 24px rgba(79,142,247,0.4)',
                        display: 'inline-flex', alignItems: 'center', gap: 9,
                    }}>
                        Get Started <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ──────────── FOOTER ──────────── */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.04)',
                padding: '28px 48px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: '1.1rem' }}>🚛</span>
                    <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                        FleetFlow <span style={{ color: '#1e293b' }}>—</span> Fleet & Logistics Management System
                    </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#1e293b' }}>
                    Built with React · Node.js · MongoDB
                </p>
            </footer>
        </div>
    );
}
