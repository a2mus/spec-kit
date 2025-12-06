import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Radio,
    Link2,
    Unlink,
    Clock,
    AlertCircle,
    CheckCircle,
    Search,
    Trash2
} from 'lucide-react';
import './CollarManagement.css';

const API_URL = 'http://localhost:3001';
const UNASSIGNED_COLLAR_ID = 9999;

function CollarManagement() {
    const [collars, setCollars] = useState([]);
    const [cattle, setCattle] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCollar, setSelectedCollar] = useState(null);
    const [selectedCattleId, setSelectedCattleId] = useState('');

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
            alert('Failed to assign collar. Please try again.');
        }
    };

    const handleUnassign = async (collar) => {
        if (!window.confirm(`Unassign collar #${collar.collar_id} from ${collar.cattle_name}?`)) return;

        try {
            await axios.patch(`${API_URL}/api/collars/${collar.id}/unassign`);
            fetchData();
        } catch (error) {
            console.error('Error unassigning collar:', error);
            alert('Failed to unassign collar. Please try again.');
        }
    };

    const handleDeleteCollar = async (collar) => {
        if (!window.confirm(`Delete collar #${collar.collar_id}? This action cannot be undone.`)) return;

        try {
            await axios.delete(`${API_URL}/api/collars/${collar.id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting collar:', error);
            alert('Failed to delete collar. Please try again.');
        }
    };

    // Separate collars by status
    const discoveredCollars = collars.filter(c =>
        c.status === 'discovered' || c.status === 'unassigned'
    );
    const activeCollars = collars.filter(c => c.status === 'active');
    const inactiveCollars = collars.filter(c => c.status === 'inactive');

    // Get unassigned cattle (no collar linked)
    const unassignedCattle = cattle.filter(c => !c.assigned_collar_id);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="collar-management">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Collar Management</h2>
                    <p className="text-secondary">Discover and assign collars to your cattle</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4">
                <div className="stat-card blue">
                    <div className="stat-card-icon"><Radio size={24} /></div>
                    <div className="stat-card-value">{collars.length}</div>
                    <div className="stat-card-label">Total Collars</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-card-icon"><AlertCircle size={24} /></div>
                    <div className="stat-card-value">{discoveredCollars.length}</div>
                    <div className="stat-card-label">Awaiting Assignment</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-icon"><CheckCircle size={24} /></div>
                    <div className="stat-card-value">{activeCollars.length}</div>
                    <div className="stat-card-label">Active</div>
                </div>
                <div className="stat-card gray">
                    <div className="stat-card-icon"><Unlink size={24} /></div>
                    <div className="stat-card-value">{inactiveCollars.length}</div>
                    <div className="stat-card-label">Inactive</div>
                </div>
            </div>

            {/* Discovered Collars */}
            {discoveredCollars.length > 0 && (
                <div className="card highlight-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <AlertCircle size={18} className="text-warning" />
                            Newly Discovered Collars
                        </h3>
                        <span className="badge badge-warning">{discoveredCollars.length} pending</span>
                    </div>
                    <p className="text-secondary mb-md">
                        These collars have been detected but not yet assigned to any cattle.
                        Click "Assign" to link them.
                    </p>
                    <div className="collar-grid">
                        {discoveredCollars.map(collar => (
                            <div key={collar.id} className="collar-card discovered">
                                <div className="collar-icon">
                                    <Radio size={24} />
                                </div>
                                <div className="collar-info">
                                    <div className="collar-id">Collar #{collar.collar_id}</div>
                                    <div className="collar-meta">
                                        <Clock size={12} />
                                        {collar.last_seen
                                            ? `Last seen: ${new Date(collar.last_seen).toLocaleString()}`
                                            : 'Never connected'}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => openAssignModal(collar)}
                                >
                                    <Link2 size={16} /> Assign
                                </button>
                                <button
                                    className="btn btn-danger btn-icon"
                                    onClick={() => handleDeleteCollar(collar)}
                                    title="Delete collar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Collars */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Active Collars</h3>
                    <span className="badge badge-success">{activeCollars.length}</span>
                </div>
                {activeCollars.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Collar ID</th>
                                    <th>Assigned To</th>
                                    <th>Tag Number</th>
                                    <th>Status</th>
                                    <th>Last Seen</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeCollars.map(collar => (
                                    <tr key={collar.id}>
                                        <td>
                                            <strong>#{collar.collar_id}</strong>
                                            {collar.pending_new_id && (
                                                <span className="badge badge-info ml-sm">
                                                    → #{collar.pending_new_id}
                                                </span>
                                            )}
                                        </td>
                                        <td>{collar.cattle_name || 'Unknown'}</td>
                                        <td>{collar.tag_number || '-'}</td>
                                        <td>
                                            <span className="badge badge-success">Active</span>
                                        </td>
                                        <td>
                                            {collar.last_seen
                                                ? new Date(collar.last_seen).toLocaleString()
                                                : '-'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleUnassign(collar)}
                                            >
                                                <Unlink size={14} /> Unassign
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon"
                                                onClick={() => handleDeleteCollar(collar)}
                                                title="Delete collar"
                                                style={{ marginLeft: '8px' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <Radio size={32} />
                        <p>No active collars yet.</p>
                        <p className="text-secondary">Assign discovered collars to get started.</p>
                    </div>
                )}
            </div>

            {/* Inactive Collars */}
            {inactiveCollars.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Inactive Collars</h3>
                        <span className="badge">{inactiveCollars.length}</span>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Collar ID</th>
                                    <th>Last Seen</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inactiveCollars.map(collar => (
                                    <tr key={collar.id}>
                                        <td><strong>#{collar.collar_id}</strong></td>
                                        <td>
                                            {collar.last_seen
                                                ? new Date(collar.last_seen).toLocaleString()
                                                : 'Never'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => openAssignModal(collar)}
                                            >
                                                <Link2 size={14} /> Reassign
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon"
                                                onClick={() => handleDeleteCollar(collar)}
                                                title="Delete collar"
                                                style={{ marginLeft: '8px' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Assign Collar #{selectedCollar?.collar_id}</h3>
                        <p className="text-secondary mb-lg">
                            Select a cattle to assign this collar to.
                            The collar will receive a new unique ID on next sync.
                        </p>

                        {unassignedCattle.length > 0 ? (
                            <>
                                <div className="form-group">
                                    <label>Select Cattle</label>
                                    <select
                                        value={selectedCattleId}
                                        onChange={(e) => setSelectedCattleId(e.target.value)}
                                    >
                                        <option value="">Choose...</option>
                                        {unassignedCattle.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name || 'Unnamed'} {c.tag_number ? `(${c.tag_number})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowAssignModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAssign}
                                        disabled={!selectedCattleId}
                                    >
                                        Assign Collar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <p>No unassigned cattle available.</p>
                                <p className="text-secondary">
                                    Add cattle in the Cattle Roster first, or unassign existing collars.
                                </p>
                                <button
                                    className="btn btn-secondary mt-md"
                                    onClick={() => setShowAssignModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CollarManagement;
