import { useEffect, useState } from 'react';
import { Plus, DollarSign, Search, Fuel } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = { vehicleId: '', fuelLiters: '', fuelCost: '', maintenanceCost: '', date: '', notes: '' };

export default function ExpensesPage() {
    const { toast } = useToast();
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const [expRes, vRes] = await Promise.all([api.get('/expenses'), api.get('/vehicles')]);
            const expData = expRes.data.data;
            setExpenses(expData.expenses || []);
            setSummary(expData.summary || {});
            setVehicles(vRes.data.data || []);
        } catch { toast('Failed to load expenses', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/expenses', form);
            toast('Expense recorded', 'success');
            setShowModal(false); setForm(EMPTY_FORM); load();
        } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
        finally { setSaving(false); }
    };

    const filtered = expenses.filter(e =>
        (!filterVehicle || e.vehicleId?._id === filterVehicle) &&
        (!search || e.vehicleId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            e.notes?.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Spinner text="Loading expenses..." />;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Expenses & Fuel</h1>
                    <p>Operational cost tracking</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
                    <Plus size={16} />Add Expense
                </button>
            </div>

            {/* Summary cards */}
            <div className="stat-grid" style={{ marginBottom: '20px' }}>
                {[
                    { label: 'Total Fuel Cost', value: `₹${(summary.totalFuelCost || 0).toLocaleString()}`, color: 'blue', icon: Fuel },
                    { label: 'Total Maintenance Cost', value: `₹${(summary.totalMaintenanceCost || 0).toLocaleString()}`, color: 'amber', icon: DollarSign },
                    { label: 'Total Operational Cost', value: `₹${(summary.totalOperationalCost || 0).toLocaleString()}`, color: 'red', icon: DollarSign },
                    { label: 'Total Fuel Consumed', value: `${(summary.totalFuelLiters || 0).toLocaleString()} L`, color: 'green', icon: Fuel },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
                        <div className="stat-info"><h4>{s.label}</h4><div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div></div>
                    </div>
                ))}
            </div>

            <div className="filters-row">
                <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ width: 'auto' }} value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
            </div>

            <div className="card">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💰</div>
                        <h3>No expenses recorded</h3>
                        <p>Add fuel and maintenance costs to track operational spend</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Vehicle</th><th>Date</th><th>Fuel (L)</th><th>Fuel Cost</th><th>Maint. Cost</th><th>Total</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(e => (
                                    <tr key={e._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.vehicleId?.name || '—'}</td>
                                        <td>{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                                        <td>{e.fuelLiters} L</td>
                                        <td style={{ color: 'var(--blue)' }}>₹{e.fuelCost?.toLocaleString()}</td>
                                        <td style={{ color: 'var(--amber)' }}>₹{e.maintenanceCost?.toLocaleString()}</td>
                                        <td style={{ color: 'var(--green)', fontWeight: 700 }}>
                                            ₹{((e.fuelCost || 0) + (e.maintenanceCost || 0)).toLocaleString()}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <Modal title="Add Expense" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" form="expense-form" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Expense'}
                        </button>
                    </>}>
                    <form id="expense-form" onSubmit={handleSave}>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Vehicle</label>
                                <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} – {v.plateNumber}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fuel Liters</label>
                                <input type="number" min="0" step="0.1" placeholder="0" value={form.fuelLiters} onChange={e => setForm({ ...form, fuelLiters: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Fuel Cost (₹)</label>
                                <input type="number" min="0" placeholder="0" value={form.fuelCost} onChange={e => setForm({ ...form, fuelCost: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Maintenance Cost (₹)</label>
                                <input type="number" min="0" placeholder="0" value={form.maintenanceCost} onChange={e => setForm({ ...form, maintenanceCost: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="form-group full-width">
                                <label>Notes (optional)</label>
                                <input placeholder="e.g. Refuel at Lagos Station" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
