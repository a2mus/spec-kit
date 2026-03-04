import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    Heart,
    Fence,
    Users,
    Radio,
    Settings,
    Shield,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, key: 'dashboard' },
    { path: '/live-map', icon: MapPin, key: 'live_map' },
    { path: '/health', icon: Heart, key: 'health_monitor' },
    { path: '/fencing', icon: Fence, key: 'fencing_zones' },
    { path: '/cattle', icon: Users, key: 'cattle_roster' },
    { path: '/collars', icon: Radio, key: 'hardware_units' },
    { path: '/settings', icon: Settings, key: 'settings' },
];

function Sidebar({ collapsed, onToggle }) {
    const { t, isRTL } = useLanguageDirection();

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon-premium">
                        <Shield size={18} fill="currentColor" />
                    </div>
                    {!collapsed && (
                        <span className="logo-text-premium">
                            CattleGuard
                        </span>
                    )}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ path, icon: Icon, key }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `nav-item-premium ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
                        }
                    >
                        <Icon size={20} />
                        {!collapsed && (
                            <span className="nav-label">
                                {t(key)}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    className="sidebar-toggle-premium"
                    onClick={onToggle}
                    style={{ position: 'relative', right: 'auto', left: 'auto', top: 'auto', transform: 'none', width: '100%', height: '36px' }}
                >
                    {collapsed
                        ? (isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)
                        : (isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />)
                    }
                </button>
                {!collapsed && (
                    <div className="user-profile-compact" style={{ marginTop: '16px' }}>
                        <div className="user-avatar" style={{
                            background: 'linear-gradient(135deg, var(--color-primary-green), var(--color-primary-blue))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '11px'
                        }}>
                            AD
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Admin User</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Farm Manager</div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
