import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import HealthMonitor from './pages/HealthMonitor';
import FencingZones from './pages/FencingZones';
import CattleRoster from './pages/CattleRoster';
import CollarManagement from './pages/CollarManagement';
import './App.css';

// Simple Settings Page Placeholder
function Settings() {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Settings</h3>
            </div>
            <div className="empty-state">
                <p>Settings page coming soon...</p>
            </div>
        </div>
    );
}

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <Router basename="/vfence">
            <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Header title="Dashboard" />
                                <div className="page-content">
                                    <Dashboard />
                                </div>
                            </>
                        } />
                        <Route path="/live-map" element={
                            <>
                                <Header title="Live Map" />
                                <div className="page-content">
                                    <LiveMap />
                                </div>
                            </>
                        } />
                        <Route path="/health" element={
                            <>
                                <Header title="Health Monitor" />
                                <div className="page-content">
                                    <HealthMonitor />
                                </div>
                            </>
                        } />
                        <Route path="/fencing" element={
                            <>
                                <Header title="Fencing Zones" />
                                <div className="page-content">
                                    <FencingZones />
                                </div>
                            </>
                        } />
                        <Route path="/cattle" element={
                            <>
                                <Header title="Cattle Roster" />
                                <div className="page-content">
                                    <CattleRoster />
                                </div>
                            </>
                        } />
                        <Route path="/collars" element={
                            <>
                                <Header title="Collar Management" />
                                <div className="page-content">
                                    <CollarManagement />
                                </div>
                            </>
                        } />
                        <Route path="/settings" element={
                            <>
                                <Header title="Settings" />
                                <div className="page-content">
                                    <Settings />
                                </div>
                            </>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
