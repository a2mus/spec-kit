import React, { useState, useEffect } from 'react';
import { Bell, Search, Clock, Cpu, Shield, Zap } from 'lucide-react';
import './Header.css';

function Header({ title, alertCount = 0 }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-title-premium">{title}</div>
            </div>

            <div className="header-center">
                <div className="search-premium">
                    <Search size={18} className="search-icon-premium" />
                    <input
                        type="text"
                        placeholder="System-wide query: search cattle, nodes or events..."
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="header-stats-premium">
                    <div className="time-box-premium">
                        <Clock size={14} />
                        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div className="system-health-indicators" style={{ display: 'flex', gap: '8px' }}>
                    <div title="Network Strength" style={{ color: 'var(--color-success)', opacity: 0.8 }}><Zap size={16} fill="currentColor" /></div>
                    <div title="Security Status" style={{ color: 'var(--color-primary-cyan)', opacity: 0.8 }}><Shield size={16} fill="currentColor" /></div>
                </div>

                <button className="notification-btn-premium">
                    <Bell size={20} />
                    {alertCount > 0 && (
                        <span className="badge-premium">{alertCount > 9 ? '9+' : alertCount}</span>
                    )}
                </button>

                <div className="header-user-premium" title="Farm Manager Profile">
                    <span>FM</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
