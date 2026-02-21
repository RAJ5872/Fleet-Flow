import { useEffect, useState } from 'react';
import { Plus, Users, Search, Pencil, Trash2, Phone } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const statusBadge = { onDuty: 'badge-blue', offDuty: 'badge-gray', suspended: 'badge-red' };
const STATUS_OPTIONS = ['onDuty', 'offDuty', 'suspended'];
const EMPTY_FORM = { name: '', contactNumber: '', licenseNumber: '', licenseExpiryDate: '', status: 'offDuty', safetyScore: 100 };

const isExpired = (d) => d && new Date(d) < new Date();

export default function DriversPage() {
    const { toast } = useToast();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data.data || []);
        } catch { toast('Failed to load drivers', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (d) => {
        setEditing(d);
        setForm({
            name: d.name, contactNumber: d.contactNumber || '',
            licenseNumber: d.licenseNumber,
            licenseExpiryDate: d.licenseExpiryDate?.split('T')[0] || '',
            status: d.status, safetyScore: d.safetyScore,
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) {
                await api.put(`/drivers/${editing._id}`, form);
                toast('Driver updated', 'success');
            } else {
                await api.post('/drivers', form);
                toast('Driver created', 'success');
            }
            setShowModal(false); load();
        } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this driver?')) return;
        try { await api.delete(`/drivers/${id}`); toast('Driver deleted', 'success'); load(); }
        catch (err) { toast(err.response?.data?.message || 'Delete failed', 'error'); }
    };

    const filtered = drivers.filter(d =>
        (!filterStatus || d.status === filterStatus) &&
        (!search || d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.licenseNumber.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Spinner text="Loading drivers..." />;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Drivers</h1>
                    <p>{drivers.length} drivers registered</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Add Driver</button>
            </div>

            <div className="filters-row">
                <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="card">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h3>No drivers found</h3>
                        <p>Register a driver to get started</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Driver</th><th>Contact</th><th>License</th><th>Expiry</th><th>Safety Score</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(d => (
                                    <tr key={d._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 36, height: 36, background: 'var(--purple-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: 'var(--purple)' }}>
                                                    {d.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {d.contactNumber ? (
                                                <a href={`tel:${d.contactNumber}`} style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    color: 'var(--green)', fontWeight: 600, fontSize: '0.85rem',
                                                    textDecoration: 'none',
                                                }}>
                                                    <Phone size={12} /> {d.contactNumber}
                                                </a>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td><code style={{ background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{d.licenseNumber}</code></td>
                                        <td>
                                            <span style={{ color: isExpired(d.licenseExpiryDate) ? 'var(--red)' : 'var(--text-secondary)' }}>
                                                {d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toLocaleDateString() : '—'}
                                                {isExpired(d.licenseExpiryDate) && ' ⚠️'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="progress-bar" style={{ width: 80 }}>
                                                    <div className="progress-fill" style={{
                                                        width: `${d.safetyScore}%`,
                                                        background: d.safetyScore >= 80 ? 'var(--green)' : d.safetyScore >= 50 ? 'var(--amber)' : 'var(--red)'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.safetyScore}</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${statusBadge[d.status] || 'badge-gray'}`}>{d.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(d)}><Pencil size={14} /></button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(d._id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <Modal title={editing ? 'Edit Driver' : 'Add Driver'} onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" form="driver-form" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                        </button>
                    </>}>
                    <form id="driver-form" onSubmit={handleSave}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input required placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Contact Number <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>*required</span></label>
                                <input required type="tel" placeholder="e.g. 9876543210"
                                    pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number"
                                    value={form.contactNumber}
                                    onChange={e => setForm({ ...form, contactNumber: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>License Number</label>
                                <input required placeholder="e.g. DL-2024-001" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>License Expiry Date</label>
                                <input required type="date" value={form.licenseExpiryDate} onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label>Safety Score (0–100): <strong>{form.safetyScore}</strong></label>
                                <input type="range" min="0" max="100" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: +e.target.value })}
                                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--blue)' }} />
                            </div>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
