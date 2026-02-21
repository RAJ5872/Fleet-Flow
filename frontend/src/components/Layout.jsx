import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { canAccess } from '../context/permissions';
import {
    LayoutDashboard, Truck, Users, Route, Wrench,
    DollarSign, BarChart3, LogOut, Sun, Moon, Lock,
} from 'lucide-react';

const NAV = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Main' },
    { to: '/vehicles', icon: Truck, label: 'Vehicles', section: 'Fleet' },
    { to: '/drivers', icon: Users, label: 'Drivers', section: 'Fleet' },
    { to: '/trips', icon: Route, label: 'Trips', section: 'Operations' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance', section: 'Operations' },
    { to: '/expenses', icon: DollarSign, label: 'Expenses', section: 'Finance' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', section: 'Finance' },
];

const ROLE_COLORS = {
    manager: '#4f8ef7', dispatcher: '#34d399',
    safetyOfficer: '#fbbf24', finance: '#8b5cf6',
};

const PAGE_TITLES = {
    '/': 'Dashboard', '/vehicles': 'Vehicles', '/drivers': 'Drivers',
    '/trips': 'Trips', '/maintenance': 'Maintenance',
    '/expenses': 'Expenses & Fuel', '/analytics': 'Analytics',
};

export default function Layout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] || 'FleetFlow';
    const roleColor = ROLE_COLORS[user?.role] || '#4f8ef7';

    const sections = [...new Set(NAV.map(n => n.section))];
    // Only keep nav items this role is permitted to see
    const allowedNav = NAV.filter(n => canAccess(user?.role, n.to));
    const visibleSections = sections.filter(s => allowedNav.some(n => n.section === s));

    return (
        <div className="layout">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-icon">🚛</div>
                    <div className="brand-text">
                        <h3>FleetFlow</h3>
                        <p>Fleet Command Center</p>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                    {visibleSections.map(section => {
                        const items = allowedNav.filter(n => n.section === section);
                        return (
                            <div className="nav-section" key={section}>
                                <p className="nav-section-label">{section}</p>
                                {items.map(({ to, icon: Icon, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === '/'}
                                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                                    >
                                        <Icon size={16} className="nav-icon" />
                                        {label}
                                    </NavLink>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {/* User chip */}
                    <div className="user-chip">
                        <div className="user-avatar" style={{ background: `linear-gradient(135deg,${roleColor},${roleColor}99)` }}>
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FF'}
                        </div>
                        <div className="user-info">
                            <h4>{user?.name || 'User'}</h4>
                            <p style={{ color: roleColor, fontWeight: 600 }}>{user?.role}</p>
                        </div>
                    </div>

                    {/* Role access scope chip */}
                    <div style={{
                        padding: '7px 10px', borderRadius: '7px', marginBottom: '8px',
                        background: `${roleColor}12`,
                        border: `1px solid ${roleColor}30`,
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.72rem', color: roleColor, fontWeight: 600,
                    }}>
                        <Lock size={12} />
                        {{
                            manager: 'Full Access — All Modules',
                            dispatcher: 'Fleet Ops — No Finance',
                            safetyOfficer: 'Safety — No Trips/Finance',
                            finance: 'Finance — Expenses & Analytics',
                        }[user?.role] || 'Restricted Access'}
                    </div>

                    {/* Status indicator */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '8px 12px', marginBottom: '6px',
                        background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
                        borderRadius: '7px', fontSize: '0.73rem', color: '#34d399',
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%', background: '#34d399',
                            boxShadow: '0 0 6px #34d399'
                        }} />
                        System Online · All services running
                    </div>

                    {/* Logout */}
                    <button className="nav-item" onClick={logout}
                        style={{ color: 'var(--red)', width: '100%', gap: '11px' }}>
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="main-content">
                {/* Top bar */}
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
                            <p style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{
                                width: 38, height: 38, borderRadius: '10px',
                                background: theme === 'dark'
                                    ? 'rgba(251,191,36,0.1)'
                                    : 'rgba(79,142,247,0.1)',
                                border: theme === 'dark'
                                    ? '1px solid rgba(251,191,36,0.25)'
                                    : '1px solid rgba(79,142,247,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                color: theme === 'dark' ? '#fbbf24' : '#4f8ef7',
                            }}
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        {/* Role badge */}
                        <div style={{
                            padding: '5px 12px', borderRadius: '99px',
                            background: `${roleColor}18`,
                            border: `1px solid ${roleColor}40`,
                            fontSize: '0.72rem', fontWeight: 700,
                            color: roleColor,
                        }}>
                            {user?.role}
                        </div>

                        {/* Avatar */}
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: `linear-gradient(135deg,${roleColor},${roleColor}99)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                            boxShadow: `0 0 12px ${roleColor}40`,
                        }}>
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FF'}
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
