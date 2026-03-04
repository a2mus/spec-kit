import React, { useState, useEffect } from 'react';
import { Clock, Zap, Shield, Bell } from 'lucide-react';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import LanguageSwitcher from '../common/LanguageSwitcher';
import './Header.css';

function Header({ title, alertCount = 0 }) {
    const { t } = useLanguageDirection();
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
                <span className="header-title-premium">
                    {t(title.toLowerCase().replace(' ', '_')) || title}
                </span>
                <div style={{ height: '16px', width: '1px', background: 'var(--border-light)', margin: '0 16px' }}></div>
                <div className="time-box-premium">
                    <Clock size={14} />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="header-right">
                <LanguageSwitcher />

                <div className="header-stats-premium">
                    <div title="Network Strength" style={{ color: '#34D399', opacity: 0.8 }}><Zap size={16} fill="currentColor" /></div>
                    <div title="Security Status" style={{ color: '#22D3EE', opacity: 0.8 }}><Shield size={16} fill="currentColor" /></div>
                </div>

                <button className="notification-btn-premium">
                    <Bell size={20} />
                    {alertCount > 0 && (
                        <span className="badge-premium">
                            {alertCount > 9 ? '9+' : alertCount}
                        </span>
                    )}
                </button>

                <div className="header-user-premium">
                    FM
                </div>
            </div>
        </header>
    );
}

export default Header;
