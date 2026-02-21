import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, Route, Wrench, TrendingUp, Navigation, Activity, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import TripMapModal from '../components/TripMapModal';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const statusBadge = { dispatched: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', draft: 'badge-gray' };

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingTrip, setTrackingTrip] = useState(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [ovRes, tripRes, vRes, dRes] = await Promise.all([
                    api.get('/analytics/overview'),
                    api.get('/trips'),
                    api.get('/vehicles'),
                    api.get('/drivers'),
                ]);
                const ov = ovRes.data.data;
                // Compute totals from vehicle status map
                const vMap = ov.vehicles || {};
                const totalVehicles = Object.values(vMap).reduce((s, n) => s + n, 0);
                const tMap = ov.trips || {};
                const totalTrips = Object.values(tMap).reduce((s, n) => s + n, 0);
                const completed = tMap.completed || 0;
                const rate = totalTrips > 0 ? `${((completed / totalTrips) * 100).toFixed(1)}%` : '0%';
                setOverview({
                    ...ov,
                    totalVehicles,
                    totalDrivers: (dRes.data.data || []).length,
                    activeDrivers: (dRes.data.data || []).filter(d => d.status === 'onDuty').length,
                    totalTrips,
                    completionRate: rate,
                });
                setTrips(tripRes.data.data || []);
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading dashboard..." />;

    const dispatched = trips.filter(t => t.status === 'dispatched');
    const recent = trips.slice(0, 5);

    const STATS = [
        { label: 'Total Vehicles', value: overview?.totalVehicles ?? 0, icon: Truck, color: 'blue', suffix: '' },
        { label: 'Active Drivers', value: overview?.activeDrivers ?? 0, icon: Users, color: 'violet', suffix: '' },
        { label: 'En Route', value: dispatched.length, icon: Navigation, color: 'green', suffix: ' trips', pulse: dispatched.length > 0 },
        { label: 'In Maintenance', value: overview?.vehicles?.inService ?? 0, icon: Wrench, color: 'amber', suffix: ' vehicles' },
        { label: 'Total Trips', value: overview?.totalTrips ?? 0, icon: Route, color: 'cyan', suffix: '' },
        { label: 'Completion Rate', value: overview?.completionRate ?? '—', icon: TrendingUp, color: 'green', suffix: '' },
    ];

    return (
        <div>
            {trackingTrip && <TripMapModal trip={trackingTrip} onClose={() => setTrackingTrip(null)} />}

            {/* Welcome banner */}
            <div style={{
                marginBottom: '24px', padding: '22px 28px',
                background: 'linear-gradient(130deg, rgba(79,142,247,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(0,0,0,0) 100%)',
                border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
            }}>
                <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Good {time.getHours() < 12 ? 'Morning' : time.getHours() < 17 ? 'Afternoon' : 'Evening'},</p>
                    <h2 style={{ fontSize: '1.55rem', fontWeight: 900, marginBottom: '4px' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #60a0ff, #8b5cf6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>{user?.name?.split(' ')[0]}</span>
                    </h2>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                        Here's your fleet overview for{' '}
                        <strong style={{ color: 'var(--text-secondary)' }}>
                            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </strong>
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '2.2rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums',
                        background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        lineHeight: 1,
                    }}>
                        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>IST – Live</p>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="stat-grid" style={{ marginBottom: '24px' }}>
                {STATS.map(s => (
                    <div className="stat-card" key={s.label} style={{ cursor: 'default', position: 'relative' }}>
                        {s.pulse && (
                            <div style={{
                                position: 'absolute', top: 12, right: 12,
                                width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                                boxShadow: '0 0 8px var(--green)', animation: 'pulse-glow 2s ease infinite',
                            }} />
                        )}
                        <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
                        <div className="stat-info">
                            <h4>{s.label}</h4>
                            <div className="stat-value">{s.value}{s.suffix && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>{s.suffix}</span>}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                {/* Active trips */}
                <div style={{ gridColumn: dispatched.length > 0 ? '1/3' : undefined }}>
                    {dispatched.length > 0 && (
                        <div className="card" style={{ marginBottom: '18px' }}>
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                                        boxShadow: '0 0 8px var(--green)', animation: 'pulse-glow 2s ease infinite'
                                    }} />
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>🚛 Active Trips — Track Live</h3>
                                </div>
                                <span className="badge badge-blue">{dispatched.length} en route</span>
                            </div>
                            <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '10px' }}>
                                {dispatched.map(t => (
                                    <div key={t._id} style={{
                                        background: 'linear-gradient(135deg, rgba(79,142,247,0.07), rgba(139,92,246,0.05))',
                                        border: '1px solid rgba(79,142,247,0.2)',
                                        borderRadius: '12px', padding: '14px',
                                        display: 'flex', flexDirection: 'column', gap: '10px',
                                        transition: 'transform 0.18s, box-shadow 0.18s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,142,247,0.18)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                            <div>
                                                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                                    {t.origin} → {t.destination}
                                                </p>
                                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {t.vehicleId?.name} · {t.driverId?.name}
                                                </p>
                                            </div>
                                            <span className="badge badge-blue" style={{ flexShrink: 0 }}>Live</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                                                <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg,#4f8ef7,#8b5cf6)', borderRadius: '99px' }} />
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--blue-bright)', fontWeight: 700, flexShrink: 0 }}>35%</span>
                                        </div>
                                        <button className="btn btn-primary btn-sm"
                                            onClick={() => setTrackingTrip(t)}
                                            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' }}>
                                            <Navigation size={13} /> Open Live Tracker
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent trips */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>⏱️ Recent Trips</h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trips')}>View All</button>
                    </div>
                    {recent.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No trips yet</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr><th>Route</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {recent.map(t => (
                                        <tr key={t._id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                                    {t.origin?.split(' ')[0]} → {t.destination?.split(' ')[0]}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    {t.vehicleId?.name}
                                                </div>
                                            </td>
                                            <td><span className={`badge ${statusBadge[t.status] || 'badge-gray'}`}>{t.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick actions */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>⚡ Quick Actions</h3>
                    </div>
                    <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                            { label: 'Add Vehicle', emoji: '🚛', color: 'var(--blue)', to: '/vehicles' },
                            { label: 'Add Driver', emoji: '👤', color: 'var(--violet)', to: '/drivers' },
                            { label: 'Create Trip', emoji: '🗺️', color: 'var(--green)', to: '/trips' },
                            { label: 'Log Maintenance', emoji: '🔧', color: 'var(--amber)', to: '/maintenance' },
                            { label: 'Add Expense', emoji: '💰', color: 'var(--cyan)', to: '/expenses' },
                            { label: 'Analytics', emoji: '📊', color: 'var(--red)', to: '/analytics' },
                        ].map(q => (
                            <button key={q.label} onClick={() => navigate(q.to)} style={{
                                background: `${q.color}0e`, border: `1px solid ${q.color}25`,
                                borderRadius: '10px', padding: '12px 10px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
                                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = `${q.color}1c`; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = `${q.color}0e`; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = ''; }}>
                                <span style={{ fontSize: '1.15rem' }}>{q.emoji}</span>
                                {q.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fleet status overview */}
                <div className="card" style={{ display: 'none' }} />
            </div>

            {/* Fleet alert if vehicles inService */}
            {(overview?.vehicles?.inService > 0 || dispatched.length > 0) && (
                <div style={{
                    marginTop: '18px', padding: '12px 16px',
                    background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '0.82rem', color: 'var(--amber)',
                }}>
                    <AlertTriangle size={15} />
                    <span>
                        {overview?.vehicles?.inService > 0 && `${overview.vehicles.inService} vehicle${overview.vehicles.inService > 1 ? 's' : ''} currently in maintenance. `}
                        {dispatched.length > 0 && `${dispatched.length} trip${dispatched.length > 1 ? 's' : ''} actively on the road.`}
                    </span>
                </div>
            )}
        </div>
    );
}
