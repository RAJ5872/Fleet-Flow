import { useEffect, useState } from 'react';
import { Plus, Truck, Search, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const statusBadge = {
    available: 'badge-green', onTrip: 'badge-blue',
    inService: 'badge-amber', retired: 'badge-gray',
};

const STATUS_OPTIONS = ['available', 'onTrip', 'inService', 'retired'];

const EMPTY_FORM = { name: '', model: '', plateNumber: '', capacity: '', odometer: '', status: 'available' };

export default function VehiclesPage() {
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const load = async () => {
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data.data || []);
        } catch { toast('Failed to load vehicles', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (v) => {
        setEditing(v); setForm({
            name: v.name, model: v.model, plateNumber: v.plateNumber,
            capacity: v.capacity, odometer: v.odometer, status: v.status
        }); setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) {
                await api.put(`/vehicles/${editing._id}`, form);
                toast('Vehicle updated', 'success');
            } else {
                await api.post('/vehicles', form);
                toast('Vehicle created', 'success');
            }
            setShowModal(false); load();
        } catch (err) {
            toast(err.response?.data?.message || 'Save failed', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        setDeleting(id);
        try { await api.delete(`/vehicles/${id}`); toast('Vehicle deleted', 'success'); load(); }
        catch (err) { toast(err.response?.data?.message || 'Delete failed', 'error'); }
        finally { setDeleting(null); }
    };

    const filtered = vehicles.filter(v =>
        (!filterStatus || v.status === filterStatus) &&
        (!search || v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.plateNumber.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Spinner text="Loading vehicles..." />;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Vehicles</h1>
                    <p>{vehicles.length} total vehicles in fleet</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Add Vehicle</button>
            </div>

            <div className="filters-row">
                <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="card">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚛</div>
                        <h3>No vehicles found</h3>
                        <p>Add your first vehicle to get started</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vehicle</th><th>Plate</th><th>Capacity</th>
                                    <th>Odometer</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(v => (
                                    <tr key={v._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 36, height: 36, background: 'var(--blue-glow)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Truck size={16} color="var(--blue)" />
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><code style={{ background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{v.plateNumber}</code></td>
                                        <td>{v.capacity?.toLocaleString()} kg</td>
                                        <td>{v.odometer?.toLocaleString()} km</td>
                                        <td><span className={`badge ${statusBadge[v.status] || 'badge-gray'}`}>{v.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(v)} title="Edit"><Pencil size={14} /></button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(v._id)}
                                                    disabled={deleting === v._id} title="Delete"><Trash2 size={14} /></button>
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
                <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" form="vehicle-form" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                        </button>
                    </>}>
                    <form id="vehicle-form" onSubmit={handleSave}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Vehicle Name</label>
                                <input required placeholder="e.g. Heavy Hauler Alpha" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Model</label>
                                <input required placeholder="e.g. Volvo FH16" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Plate Number</label>
                                <input required placeholder="e.g. FF-001-TK" value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Capacity (kg)</label>
                                <input required type="number" min="0" placeholder="20000" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Odometer (km)</label>
                                <input type="number" min="0" placeholder="0" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
