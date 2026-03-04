import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    Heart,
    Fence,
    Settings,
    ChevronLeft,
    ChevronRight,
    Users,
    Radio,
    Shield
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Control Center' },
    { path: '/live-map', icon: MapPin, label: 'Geospatial Map' },
    { path: '/health', icon: Heart, label: 'Biometrics' },
    { path: '/fencing', icon: Fence, label: 'Virtual Fencing' },
    { path: '/cattle', icon: Users, label: 'Herd Registry' },
    { path: '/collars', icon: Radio, label: 'Hardware Units' },
    { path: '/settings', icon: Settings, label: 'System Prefs' },
];

function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon-premium">
                        <Shield size={20} fill="currentColor" />
                    </div>
                    {!collapsed && <span className="logo-text-premium">CattleGuard</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => `nav-item-premium ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        {!collapsed && <span className="nav-label">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <button className="sidebar-toggle-premium" onClick={onToggle} title={collapsed ? "Expand" : "Collapse"}>
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {!collapsed && (
                <div className="sidebar-footer">
                    <div className="user-profile-compact">
                        <div className="user-avatar"></div>
                        <div className="user-info">
                            <div className="user-name" style={{ fontSize: '12px', fontWeight: '700' }}>Admin User</div>
                            <div className="user-role" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Farm Manager</div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;
