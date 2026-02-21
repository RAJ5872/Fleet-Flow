import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, Fuel } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/Spinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? `₹${p.value.toLocaleString()}` : p.value}</p>
            ))}
        </div>
    );
};

export default function AnalyticsPage() {
    const [overview, setOverview] = useState(null);
    const [costData, setCostData] = useState([]);
    const [completionRate, setCompletionRate] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [fuelData, setFuelData] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [loading, setLoading] = useState(true);
    const [fuelLoading, setFuelLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [ovRes, costRes, rateRes, vRes] = await Promise.all([
                    api.get('/analytics/overview'),
                    api.get('/analytics/cost-per-vehicle'),
                    api.get('/analytics/trip-completion-rate'),
                    api.get('/vehicles'),
                ]);
                setOverview(ovRes.data.data);
                setCostData(costRes.data.data || []);
                setCompletionRate(rateRes.data.data);
                setVehicles(vRes.data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const loadFuelEfficiency = async (vehicleId) => {
        if (!vehicleId) return;
        setFuelLoading(true);
        try {
            const { data } = await api.get(`/analytics/fuel-efficiency/${vehicleId}`);
            setFuelData(data.data);
        } catch { setFuelData(null); }
        finally { setFuelLoading(false); }
    };

    const handleVehicleChange = (id) => { setSelectedVehicle(id); loadFuelEfficiency(id); };

    if (loading) return <Spinner text="Loading analytics..." />;

    const tripPieData = completionRate ? [
        { name: 'Completed', value: completionRate.completed || 0 },
        { name: 'Cancelled', value: completionRate.cancelled || 0 },
        { name: 'Dispatched', value: completionRate.dispatched || 0 },
        { name: 'Draft', value: completionRate.draft || 0 },
    ].filter(d => d.value > 0) : [];

    const vehicleStatusData = overview?.vehicles
        ? Object.entries(overview.vehicles).map(([name, value]) => ({ name, value }))
        : [];

    const chartCostData = costData.map(d => ({
        name: d.vehicleName || d.plateNumber,
        fuelCost: d.totalFuelCost,
        maintenanceCost: d.totalMaintenanceCost,
    }));

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Analytics</h1>
                    <p>Fleet performance insights</p>
                </div>
            </div>

            {/* KPI row */}
            <div className="stat-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon blue"><Target size={22} /></div>
                    <div className="stat-info">
                        <h4>Trip Completion Rate</h4>
                        <div className="stat-value">{completionRate?.completionRate || '0%'}</div>
                        <p className="stat-sub">{completionRate?.completed || 0} of {completionRate?.total || 0} trips</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><TrendingUp size={22} /></div>
                    <div className="stat-info">
                        <h4>Total Operational Cost</h4>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                            ₹{costData.reduce((s, d) => s + (d.totalOperationalCost || 0), 0).toLocaleString()}
                        </div>
                        <p className="stat-sub">All vehicles</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon amber"><BarChart3 size={22} /></div>
                    <div className="stat-info">
                        <h4>Vehicles Tracked</h4>
                        <div className="stat-value">{costData.length}</div>
                        <p className="stat-sub">With cost data</p>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Cost per vehicle bar chart */}
                <div className="chart-box">
                    <h3>💰 Cost Per Vehicle</h3>
                    {chartCostData.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No expense data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartCostData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                                <Bar dataKey="fuelCost" name="Fuel Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="maintenanceCost" name="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Trip completion pie */}
                <div className="chart-box">
                    <h3>🗺️ Trip Status Breakdown</h3>
                    {tripPieData.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No trip data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={tripPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                                    paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}>
                                    {tripPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => [v, 'Trips']} />
                                <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Vehicle status */}
                <div className="chart-box">
                    <h3>🚛 Vehicle Status Distribution</h3>
                    {vehicleStatusData.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No vehicle data</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={vehicleStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Vehicles" radius={[0, 4, 4, 0]}>
                                    {vehicleStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Fuel efficiency calculator */}
                <div className="chart-box">
                    <h3><Fuel size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Fuel Efficiency</h3>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Select Vehicle</label>
                        <select value={selectedVehicle} onChange={e => handleVehicleChange(e.target.value)}>
                            <option value="">Choose a vehicle...</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} – {v.plateNumber}</option>)}
                        </select>
                    </div>

                    {fuelLoading && <Spinner text="Calculating..." />}

                    {!fuelLoading && fuelData && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { label: 'Total Distance', value: `${fuelData.totalDistance?.toLocaleString()} km`, color: 'var(--blue)' },
                                { label: 'Fuel Consumed', value: `${fuelData.totalFuelLiters?.toLocaleString()} L`, color: 'var(--amber)' },
                                { label: 'Fuel Efficiency', value: fuelData.fuelEfficiency, color: 'var(--green)', span: true },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: 'var(--bg-secondary)', borderRadius: '8px', padding: '14px',
                                    border: `1px solid var(--border)`, gridColumn: item.span ? '1 / -1' : undefined
                                }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</p>
                                    <p style={{ fontSize: item.span ? '1.6rem' : '1.2rem', fontWeight: 800, color: item.color }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {!fuelLoading && !fuelData && selectedVehicle && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a vehicle to calculate efficiency</p>
                    )}
                </div>
            </div>
        </div>
    );
}
