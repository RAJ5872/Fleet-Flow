import { useEffect, useState } from 'react';
import { Plus, Wrench, Search } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = { vehicleId: '', description: '', cost: '', date: '' };

export default function MaintenancePage() {
    const { toast } = useToast();
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const [logRes, vRes] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
            setLogs(logRes.data.data || []);
            setVehicles(vRes.data.data || []);
        } catch { toast('Failed to load', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/maintenance', form);
            toast('Maintenance logged – vehicle set to inService 🔧', 'success');
            setShowModal(false); setForm(EMPTY_FORM); load();
        } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
        finally { setSaving(false); }
    };

    const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

    const filtered = logs.filter(l =>
        (!filterVehicle || l.vehicleId?._id === filterVehicle) &&
        (!search || l.description?.toLowerCase().includes(search.toLowerCase()) ||
            l.vehicleId?.name?.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Spinner text="Loading maintenance logs..." />;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Maintenance</h1>
                    <p>{logs.length} logs · Total cost: ₹{totalCost.toLocaleString()}</p>
                </div>
                <button className="btn btn-amber" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
                    <Plus size={16} />Log Maintenance
                </button>
            </div>

            <div className="filters-row">
                <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ width: 'auto' }} value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
            </div>

            {/* Summary stat */}
            <div className="stat-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(3,1fr)' }}>
                {[
                    { label: 'Total Logs', value: logs.length, color: 'blue' },
                    { label: 'Total Cost', value: `₹${totalCost.toLocaleString()}`, color: 'amber' },
                    { label: 'Vehicles Serviced', value: new Set(logs.map(l => l.vehicleId?._id)).size, color: 'green' },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className={`stat-icon ${s.color}`}><Wrench size={22} /></div>
                        <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
                    </div>
                ))}
            </div>

            <div className="card">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔧</div>
                        <h3>No maintenance logs</h3>
                        <p>Log a maintenance event to track service history</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Vehicle</th><th>Description</th><th>Date</th><th>Cost</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(l => (
                                    <tr key={l._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: 30, height: 30, background: 'var(--amber-glow)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Wrench size={14} color="var(--amber)" />
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{l.vehicleId?.name || '—'}</div>
                                                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{l.vehicleId?.plateNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '280px' }}>{l.description}</td>
                                        <td>{l.date ? new Date(l.date).toLocaleDateString() : '—'}</td>
                                        <td style={{ color: 'var(--amber)', fontWeight: 600 }}>₹{l.cost?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <Modal title="Log Maintenance" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-amber" form="maint-form" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Log Maintenance'}
                        </button>
                    </>}>
                    <form id="maint-form" onSubmit={handleSave}>
                        <div className="form-grid cols-1" style={{ gap: '14px' }}>
                            <div className="form-group">
                                <label>Vehicle</label>
                                <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} – {v.plateNumber}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea required rows={3} placeholder="e.g. Engine oil change, brake pad replacement..."
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Cost (₹)</label>
                                    <input required type="number" min="0" placeholder="500" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '12px', padding: '10px', background: 'var(--amber-glow)', borderRadius: '8px',
                            fontSize: '0.8rem', color: 'var(--amber)', border: '1px solid var(--border)'
                        }}>
                            ⚠️ Creating a maintenance log will automatically set the vehicle status to <strong>inService</strong>.
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
