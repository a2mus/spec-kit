import React, { useState, useEffect } from 'react';
import { Bell, Search, Clock } from 'lucide-react';
import './Header.css';

function Header({ title, alertCount = 0 }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-center">
                <div className="search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search cattle by ID..."
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="header-time">
                    <Clock size={16} />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <button className="notification-btn">
                    <Bell size={20} />
                    {alertCount > 0 && (
                        <span className="notification-badge">{alertCount > 9 ? '9+' : alertCount}</span>
                    )}
                </button>

                <div className="user-avatar">
                    <span>FM</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
