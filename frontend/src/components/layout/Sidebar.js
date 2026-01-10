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
    Radio
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/live-map', icon: MapPin, label: 'Live Map' },
    { path: '/health', icon: Heart, label: 'Health Monitor' },
    { path: '/fencing', icon: Fence, label: 'Fencing Zones' },
    { path: '/cattle', icon: Users, label: 'Cattle Roster' },
    { path: '/collars', icon: Radio, label: 'Collars' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    {!collapsed && <span className="logo-text">CattleGuard</span>}
                    {collapsed && <span className="logo-icon">CG</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        {!collapsed && <span className="nav-label">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <button className="sidebar-toggle" onClick={onToggle}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}

export default Sidebar;
