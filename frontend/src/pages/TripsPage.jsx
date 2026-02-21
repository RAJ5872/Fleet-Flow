import { useEffect, useState } from 'react';
import { Plus, Search, Play, CheckCircle, XCircle, Navigation } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import TripMapModal from '../components/TripMapModal';
import PlaceInput from '../components/PlaceInput';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const statusBadge = {
    draft: 'badge-gray', dispatched: 'badge-blue',
    completed: 'badge-green', cancelled: 'badge-red',
};

const EMPTY_FORM = {
    vehicleId: '', driverId: '', cargoWeight: '',
    origin: '', destination: '', startOdometer: '',
};

export default function TripsPage() {
    const { toast } = useToast();
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showComplete, setShowComplete] = useState(null);
    const [trackingTrip, setTrackingTrip] = useState(null);
    const [endOdometer, setEndOdometer] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const [tripRes, vRes, dRes] = await Promise.all([
                api.get('/trips'), api.get('/vehicles'), api.get('/drivers'),
            ]);
            setTrips(tripRes.data.data || []);
            setVehicles(vRes.data.data || []);
            setDrivers(dRes.data.data || []);
        } catch { toast('Failed to load trips', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/trips', form);
            toast('Trip created (draft)', 'success');
            setShowCreate(false); setForm(EMPTY_FORM); load();
        } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
        finally { setSaving(false); }
    };

    const handleDispatch = async (id) => {
        try { await api.put(`/trips/${id}/dispatch`); toast('Trip dispatched! 🚛', 'success'); load(); }
        catch (err) { toast(err.response?.data?.message || 'Dispatch failed', 'error'); }
    };

    const handleComplete = async () => {
        try {
            await api.put(`/trips/${showComplete}/complete`, { endOdometer: endOdometer ? +endOdometer : undefined });
            toast('Trip completed! ✅', 'success'); setShowComplete(null); setEndOdometer(''); load();
        } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this trip?')) return;
        try { await api.put(`/trips/${id}/cancel`); toast('Trip cancelled', 'info'); load(); }
        catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    };

    const dispatched = trips.filter(t => t.status === 'dispatched');
    const filtered = trips.filter(t =>
        (!filterStatus || t.status === filterStatus) &&
        (!search ||
            t.origin?.toLowerCase().includes(search.toLowerCase()) ||
            t.destination?.toLowerCase().includes(search.toLowerCase()) ||
            t.vehicleId?.name?.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Spinner text="Loading trips..." />;

    return (
        <div>
            {/* Map tracker */}
            {trackingTrip && (
                <TripMapModal trip={trackingTrip} onClose={() => setTrackingTrip(null)} />
            )}

            {/* Page header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>Trips</h1>
                    <p>
                        {trips.length} total ·{' '}
                        <span style={{ color: 'var(--blue-bright)' }}>{dispatched.length} en route</span>
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={16} /> Create Trip
                </button>
            </div>

            {/* Active trips banner */}
            {dispatched.length > 0 && (
                <div style={{
                    marginBottom: '20px', padding: '14px 18px',
                    background: 'linear-gradient(90deg, rgba(79,142,247,0.1), rgba(139,92,246,0.06))',
                    border: '1px solid rgba(79,142,247,0.25)', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '10px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#4f8ef7',
                            boxShadow: '0 0 8px #4f8ef7', animation: 'pulse-glow 2s ease infinite',
                        }} />
                        <span style={{ fontWeight: 700, color: '#eef2ff', fontSize: '0.9rem' }}>
                            {dispatched.length} active trip{dispatched.length > 1 ? 's' : ''} currently on the road
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {dispatched.map(t => (
                            <button key={t._id} className="btn btn-primary btn-sm"
                                onClick={() => setTrackingTrip(t)}
                                style={{ gap: '5px', fontSize: '0.78rem' }}>
                                <Navigation size={12} /> Track {t.vehicleId?.name || 'Vehicle'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-row">
                <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input placeholder="Search trips..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ width: 'auto' }} value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    {['draft', 'dispatched', 'completed', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Trips table */}
            <div className="card">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗺️</div>
                        <h3>No trips found</h3>
                        <p>Create a trip to get started</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Route</th>
                                    <th>Vehicle</th>
                                    <th>Driver</th>
                                    <th>Cargo</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t._id}>
                                        <td>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                {t.origin} → {t.destination}
                                            </div>
                                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {t.vehicleId?.name || '—'}
                                            </div>
                                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                                                {t.vehicleId?.plateNumber}
                                            </div>
                                        </td>
                                        <td>{t.driverId?.name || '—'}</td>
                                        <td>{t.cargoWeight?.toLocaleString()} kg</td>
                                        <td>
                                            <span className={`badge ${statusBadge[t.status] || 'badge-gray'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {t.status === 'draft' && (
                                                    <>
                                                        <button className="btn btn-primary btn-sm"
                                                            onClick={() => handleDispatch(t._id)}>
                                                            <Play size={12} /> Dispatch
                                                        </button>
                                                        <button className="btn btn-danger btn-sm"
                                                            onClick={() => handleCancel(t._id)}>
                                                            <XCircle size={12} /> Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {t.status === 'dispatched' && (
                                                    <>
                                                        <button className="btn btn-primary btn-sm"
                                                            onClick={() => setTrackingTrip(t)}
                                                            style={{ background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' }}>
                                                            <Navigation size={12} /> Track
                                                        </button>
                                                        <button className="btn btn-success btn-sm"
                                                            onClick={() => { setShowComplete(t._id); setEndOdometer(''); }}>
                                                            <CheckCircle size={12} /> Complete
                                                        </button>
                                                        <button className="btn btn-danger btn-sm"
                                                            onClick={() => handleCancel(t._id)}>
                                                            <XCircle size={12} /> Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {['completed', 'cancelled'].includes(t.status) && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {t.endOdometer && t.startOdometer
                                                            ? `📍 ${(t.endOdometer - t.startOdometer).toLocaleString()} km`
                                                            : '—'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Create Trip Modal ── */}
            {showCreate && (
                <Modal
                    title="Create Trip"
                    onClose={() => setShowCreate(false)}
                    size="lg"
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" form="trip-form" type="submit" disabled={saving}>
                                {saving ? 'Creating...' : 'Create Trip'}
                            </button>
                        </>
                    }
                >
                    <form id="trip-form" onSubmit={handleCreate}>
                        <div className="form-grid">
                            {/* Vehicle */}
                            <div className="form-group">
                                <label>Vehicle</label>
                                <select required value={form.vehicleId}
                                    onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.filter(v => v.status === 'available').map(v => (
                                        <option key={v._id} value={v._id}>
                                            {v.name} – {v.plateNumber} (cap: {v.capacity} kg)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Driver */}
                            <div className="form-group">
                                <label>Driver</label>
                                <select required value={form.driverId}
                                    onChange={e => setForm({ ...form, driverId: e.target.value })}>
                                    <option value="">Select driver...</option>
                                    {drivers.filter(d => d.status !== 'suspended').map(d => (
                                        <option key={d._id} value={d._id}>
                                            {d.name} – {d.licenseNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Origin — autocomplete */}
                            <div className="form-group">
                                <label>Origin</label>
                                <PlaceInput
                                    required
                                    value={form.origin}
                                    onChange={val => setForm({ ...form, origin: val })}
                                    placeholder="e.g. Mumbai JNPT Port"
                                />
                            </div>

                            {/* Destination — autocomplete */}
                            <div className="form-group">
                                <label>Destination</label>
                                <PlaceInput
                                    required
                                    value={form.destination}
                                    onChange={val => setForm({ ...form, destination: val })}
                                    placeholder="e.g. Delhi ICD Patparganj"
                                />
                            </div>

                            {/* Cargo weight */}
                            <div className="form-group">
                                <label>Cargo Weight (kg)</label>
                                <input required type="number" min="0" placeholder="15000"
                                    value={form.cargoWeight}
                                    onChange={e => setForm({ ...form, cargoWeight: e.target.value })} />
                            </div>

                            {/* Start odometer */}
                            <div className="form-group">
                                <label>Start Odometer (km)</label>
                                <input type="number" min="0" placeholder="45200"
                                    value={form.startOdometer}
                                    onChange={e => setForm({ ...form, startOdometer: e.target.value })} />
                            </div>
                        </div>

                        <div style={{
                            marginTop: '14px', padding: '10px 14px',
                            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
                            borderRadius: '8px', fontSize: '0.78rem', color: 'var(--amber)',
                        }}>
                            ⚠️ Cargo weight must not exceed vehicle capacity · Driver license must not be expired
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Complete Trip Modal ── */}
            {showComplete && (
                <Modal
                    title="Complete Trip"
                    onClose={() => setShowComplete(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setShowComplete(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={handleComplete}>
                                ✅ Mark Complete
                            </button>
                        </>
                    }
                >
                    <div className="form-group">
                        <label>End Odometer (km) — optional</label>
                        <input type="number" min="0" placeholder="Enter final odometer reading"
                            value={endOdometer} onChange={e => setEndOdometer(e.target.value)} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                        Completing this trip will set the vehicle and driver back to available / offDuty.
                    </p>
                </Modal>
            )}
        </div>
    );
}
