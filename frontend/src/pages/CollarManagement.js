import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Radio,
    Link2,
    Unlink,
    Clock,
    AlertCircle,
    CheckCircle,
    Search,
    Trash2,
    MapPin,
    Wifi,
    Battery,
    Cpu,
    ArrowRight,
    X,
    ShieldAlert
} from 'lucide-react';
import './CollarManagement.css';

const API_URL = 'http://localhost:3001';

function CollarManagement() {
    const navigate = useNavigate();
    const [collars, setCollars] = useState([]);
    const [cattle, setCattle] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCollar, setSelectedCollar] = useState(null);
    const [selectedCattleId, setSelectedCattleId] = useState('');

    const handleLocate = (collarId) => {
        navigate(`/live-map?collar=${collarId}`);
    };

    const fetchData = async () => {
        try {
            const [collarsRes, cattleRes] = await Promise.all([
                axios.get(`${API_URL}/api/collars`),
                axios.get(`${API_URL}/api/cattle`)
            ]);
            setCollars(collarsRes.data);
            setCattle(cattleRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const openAssignModal = (collar) => {
        setSelectedCollar(collar);
        setSelectedCattleId('');
        setShowAssignModal(true);
    };

    const handleAssign = async () => {
        if (!selectedCollar || !selectedCattleId) return;

        try {
            await axios.patch(`${API_URL}/api/collars/${selectedCollar.id}/assign`, {
                cattle_id: parseInt(selectedCattleId)
            });
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            console.error('Error assigning collar:', error);
        }
    };

    const handleUnassign = async (collar) => {
        if (!window.confirm(`Dissociate hardware unit #${collar.collar_id} from ${collar.cattle_name}?`)) return;

        try {
            await axios.patch(`${API_URL}/api/collars/${collar.id}/unassign`);
            fetchData();
        } catch (error) {
            console.error('Error unassigning collar:', error);
        }
    };

    const handleDeleteCollar = async (collar) => {
        if (!window.confirm(`Decommission hardware unit #${collar.collar_id}? This action is permanent.`)) return;

        try {
            await axios.delete(`${API_URL}/api/collars/${collar.id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting collar:', error);
        }
    };

    const discoveredCollars = collars.filter(c =>
        c.status === 'discovered' || c.status === 'unassigned'
    );
    const activeCollars = collars.filter(c => c.status === 'active');
    const inactiveCollars = collars.filter(c => c.status === 'inactive');

    const unassignedCattle = cattle.filter(c => !c.assigned_collar_id);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="collar-management-premium">
            <header className="page-header-premium">
                <div className="header-info">
                    <h2 className="title-gradient">Hardware Ecosystem</h2>
                    <p className="subtitle">Lifecycle management for sensory collars and edge nodes</p>
                </div>
            </header>

            <div className="stats-grid-premium">
                <div className="stat-card-premium cyan">
                    <div className="stat-icon"><Cpu size={24} /></div>
                    <div className="stat-details">
                        <span className="stat-value">{collars.length}</span>
                        <span className="stat-label">Total Units</span>
                    </div>
                </div>
                <div className="stat-card-premium amber">
                    <div className="stat-icon"><Wifi size={24} /></div>
                    <div className="stat-details">
                        <span className="stat-value">{discoveredCollars.length}</span>
                        <span className="stat-label">Pending Sync</span>
                    </div>
                </div>
                <div className="stat-card-premium green">
                    <div className="stat-icon"><CheckCircle size={24} /></div>
                    <div className="stat-details">
                        <span className="stat-value">{activeCollars.length}</span>
                        <span className="stat-label">Operational</span>
                    </div>
                </div>
                <div className="stat-card-premium gray">
                    <div className="stat-icon"><Battery size={24} className="opacity-50" /></div>
                    <div className="stat-details">
                        <span className="stat-value">{inactiveCollars.length}</span>
                        <span className="stat-label">Offline / Error</span>
                    </div>
                </div>
            </div>

            {discoveredCollars.length > 0 && (
                <section className="section-premium highlighted">
                    <div className="section-header-premium">
                        <div className="header-title">
                            <ShieldAlert size={20} className="text-amber" />
                            <h3>Discovered Edge Nodes</h3>
                        </div>
                        <span className="badge-amber">{discoveredCollars.length} Unassigned</span>
                    </div>
                    <div className="nodes-grid">
                        {discoveredCollars.map(collar => (
                            <div key={collar.id} className="node-card-premium discovered">
                                <div className="node-status-indicator"></div>
                                <div className="node-info">
                                    <div className="node-id">Node ID: #{collar.collar_id}</div>
                                    <div className="node-meta">
                                        <Clock size={12} />
                                        <span>{collar.last_seen ? `Detected ${new Date(collar.last_seen).toLocaleTimeString()}` : 'First Discovery'}</span>
                                    </div>
                                </div>
                                <div className="node-actions-compact">
                                    <button className="btn-premium-sm" onClick={() => openAssignModal(collar)}>
                                        <Link2 size={14} /> Link Cattle
                                    </button>
                                    <button className="btn-ghost-danger-sm" onClick={() => handleDeleteCollar(collar)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="card-premium operational-roster">
                <div className="card-header-premium">
                    <div className="header-icon-group">
                        <CheckCircle size={18} className="text-success" />
                        <h3 className="card-title">Operational Surface Units</h3>
                    </div>
                    <div className="header-badges">
                        <span className="badge-cyan">{activeCollars.length} Monitored</span>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Unit Identity</th>
                                <th>Assigned Host</th>
                                <th>Network Status</th>
                                <th>Telemetry Sync</th>
                                <th align="right">Command Console</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeCollars.map(collar => (
                                <tr key={collar.id}>
                                    <td>
                                        <div className="unit-id-group">
                                            <span className="unit-primary">Unit #{collar.collar_id}</span>
                                            {collar.pending_new_id && <span className="id-migration">Re-ID in progress: #{collar.pending_new_id}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="host-link">
                                            <span className="host-name">{collar.cattle_name || 'Generic Host'}</span>
                                            <span className="host-tag">{collar.tag_number || 'IDENT-NULL'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="network-status active">
                                            <div className="pulse-dot"></div>
                                            <span>Operational</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="telemetry-meta">
                                            <Clock size={12} className="opacity-50" />
                                            <span>{collar.last_seen ? new Date(collar.last_seen).toLocaleString() : 'Never'}</span>
                                        </div>
                                    </td>
                                    <td align="right">
                                        <div className="console-actions">
                                            <button className="console-btn primary" onClick={() => handleLocate(collar.collar_id)} title="Ping on map">
                                                <MapPin size={16} /> Locate
                                            </button>
                                            <button className="console-btn secondary" onClick={() => handleUnassign(collar)} title="Break link">
                                                <Unlink size={16} /> Unlink
                                            </button>
                                            <button className="console-btn danger" onClick={() => handleDeleteCollar(collar)} title="Decommission">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeCollars.length === 0 && (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state-premium">
                                            <Wifi size={40} className="empty-icon" />
                                            <h4>No Operational Units Detected</h4>
                                            <p>Scan for nearby edge nodes to begin telemetry streaming.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAssignModal && (
                <div className="modal-overlay-premium">
                    <div className="modal-premium">
                        <header className="modal-header">
                            <div className="header-icon cyan">
                                <Link2 size={24} />
                            </div>
                            <div className="header-text">
                                <h3>Hardware Link Protocol</h3>
                                <p>Binding Unit #{selectedCollar?.collar_id} to livestock</p>
                            </div>
                            <button className="btn-close" onClick={() => setShowAssignModal(false)}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className="modal-body">
                            {unassignedCattle.length > 0 ? (
                                <>
                                    <div className="input-group-premium full-width">
                                        <label>Target Livestock Host</label>
                                        <select
                                            value={selectedCattleId}
                                            onChange={(e) => setSelectedCattleId(e.target.value)}
                                            className="premium-select"
                                        >
                                            <option value="">Select identity...</option>
                                            {unassignedCattle.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name || 'Unnamed'} {c.tag_number ? `[${c.tag_number}]` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="alert-box info mt-lg">
                                        <Info size={16} />
                                        <p>Hardware ID rotation will occur immediately upon binding to maintain encryption integrity.</p>
                                    </div>
                                    <footer className="modal-footer mt-xl">
                                        <button className="btn-ghost" onClick={() => setShowAssignModal(false)}>
                                            Abort
                                        </button>
                                        <button
                                            className="btn-premium"
                                            onClick={handleAssign}
                                            disabled={!selectedCattleId}
                                        >
                                            Execute Link
                                        </button>
                                    </footer>
                                </>
                            ) : (
                                <div className="empty-state-modal">
                                    <AlertCircle size={48} className="text-amber opacity-30" />
                                    <h4>No Identifiable Hosts</h4>
                                    <p>Initialize new livestock profiles in the registry before attempting hardware binding.</p>
                                    <button className="btn-premium mt-lg" onClick={() => navigate('/cattle')}>
                                        Go to Registry <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Internal Info component duplicate just for readability
const Info = ({ size, className }) => <AlertCircle size={size} className={className} />;

export default CollarManagement;
