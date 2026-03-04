import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    Edit2,
    Trash2,
    Radio,
    Search,
    X,
    MapPin,
    ChevronRight,
    Filter,
    Download,
    MoreHorizontal,
    Info,
    Calendar,
    Weight,
    Stethoscope
} from 'lucide-react';
import './CattleRoster.css';

const API_URL = 'http://localhost:3001';

function CattleRoster() {
    const navigate = useNavigate();
    const [cattle, setCattle] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCattle, setEditingCattle] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        tag_number: '',
        breed: '',
        birth_date: '',
        gender: '',
        weight_kg: '',
        notes: ''
    });

    const handleLocate = (collarId) => {
        navigate(`/live-map?collar=${collarId}`);
    };

    const fetchCattle = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/cattle`);
            setCattle(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cattle:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCattle();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setEditingCattle(null);
        setFormData({
            name: '',
            tag_number: '',
            breed: '',
            birth_date: '',
            gender: '',
            weight_kg: '',
            notes: ''
        });
        setShowModal(true);
    };

    const openEditModal = (cow) => {
        setEditingCattle(cow);
        setFormData({
            name: cow.name || '',
            tag_number: cow.tag_number || '',
            breed: cow.breed || '',
            birth_date: cow.birth_date ? cow.birth_date.split('T')[0] : '',
            gender: cow.gender || '',
            weight_kg: cow.weight_kg || '',
            notes: cow.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCattle) {
                await axios.patch(`${API_URL}/api/cattle/${editingCattle.id}`, formData);
            } else {
                await axios.post(`${API_URL}/api/cattle`, formData);
            }
            setShowModal(false);
            fetchCattle();
        } catch (error) {
            console.error('Error saving cattle:', error);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}" registry? This action is irreversible.`)) return;
        try {
            await axios.delete(`${API_URL}/api/cattle/${id}`);
            fetchCattle();
        } catch (error) {
            console.error('Error deleting cattle:', error);
        }
    };

    const filteredCattle = cattle.filter(cow =>
        (cow.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (cow.tag_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (cow.breed?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="cattle-roster-premium">
            <header className="page-header-premium">
                <div className="header-info">
                    <h2 className="title-gradient">Herd Registry</h2>
                    <p className="subtitle">Comprehensive management of individual livestock data</p>
                </div>
                <div className="header-actions">
                    <button className="btn-ghost-cyan">
                        <Download size={18} /> Export
                    </button>
                    <button className="btn-premium" onClick={openAddModal}>
                        <Plus size={18} /> Add Entry
                    </button>
                </div>
            </header>

            <div className="roster-controls">
                <div className="search-bar-premium">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Filter by identifier, breed or genetic tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-filter">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="card-premium roster-table-card">
                <div className="table-responsive">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Identification</th>
                                <th>Genetic / Breed</th>
                                <th>Gender</th>
                                <th>Biometrics</th>
                                <th>Device Link</th>
                                <th>Status</th>
                                <th align="right">Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCattle.map(cow => (
                                <tr key={cow.id}>
                                    <td>
                                        <div className="id-cell">
                                            <div className="avatar-placeholder">
                                                {cow.name?.charAt(0) || 'C'}
                                            </div>
                                            <div className="name-group">
                                                <span className="id-primary">{cow.name || 'Unnamed Cow'}</span>
                                                <span className="id-secondary">{cow.tag_number || 'NO-TAG'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="breed-chip">{cow.breed || 'Undefined'}</span>
                                    </td>
                                    <td className="capitalize">{cow.gender || 'Unknown'}</td>
                                    <td>
                                        <div className="bio-metrics">
                                            <span title="Weight"><Weight size={12} /> {cow.weight_kg ? `${cow.weight_kg} kg` : '--'}</span>
                                            <span title="Age"><Calendar size={12} /> {cow.birth_date ? new Date(cow.birth_date).toLocaleDateString() : '--'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {cow.assigned_collar_id ? (
                                            <div className="collar-link active" onClick={() => handleLocate(cow.assigned_collar_id)}>
                                                <Radio size={12} /> <span>#{cow.assigned_collar_id}</span>
                                                <MapPin size={12} className="map-link-icon" />
                                            </div>
                                        ) : (
                                            <div className="collar-link unassigned">
                                                <Radio size={12} /> <span>Unlinked</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-dot-pill ${cow.assigned_collar_id ? 'monitored' : 'offline'}`}>
                                            {cow.assigned_collar_id ? 'Monitored' : 'No Signal'}
                                        </span>
                                    </td>
                                    <td align="right">
                                        <div className="row-actions">
                                            <button className="btn-icon-row" onClick={() => openEditModal(cow)} title="Edit profile">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-row delete" onClick={() => handleDelete(cow.id, cow.name)} title="Remove entry">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCattle.length === 0 && (
                                <tr>
                                    <td colSpan="7">
                                        <div className="empty-state-premium">
                                            <Info size={40} className="empty-icon" />
                                            <h4>No matching records found</h4>
                                            <p>Try adjusting your filters or add a new livestock entry.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay-premium">
                    <div className="modal-premium modal-wide">
                        <header className="modal-header">
                            <div className="header-icon cyan">
                                {editingCattle ? <Edit2 size={20} /> : <Plus size={20} />}
                            </div>
                            <div className="header-text">
                                <h3>{editingCattle ? 'Update Livestock Registry' : 'New Livestock Entry'}</h3>
                                <p>Fill in the biometric and identification data</p>
                            </div>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-grid">
                                <div className="input-group-premium">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Identification name"
                                        required
                                    />
                                </div>
                                <div className="input-group-premium">
                                    <label>Visual Tag Number</label>
                                    <input
                                        type="text"
                                        name="tag_number"
                                        value={formData.tag_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g. BE-0192"
                                        required
                                    />
                                </div>
                                <div className="input-group-premium">
                                    <label>Genetic Breed</label>
                                    <input
                                        type="text"
                                        name="breed"
                                        value={formData.breed}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Charolais"
                                    />
                                </div>
                                <div className="input-group-premium">
                                    <label>Gender / Sex</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Select gender</option>
                                        <option value="female">Heifer / Cow</option>
                                        <option value="male">Bull / Steer</option>
                                    </select>
                                </div>
                                <div className="input-group-premium">
                                    <label>Birth Date</label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-group-premium">
                                    <label>Registration Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight_kg"
                                        value={formData.weight_kg}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="input-group-premium full-width">
                                <label>Clinical / Descriptive Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Observe health conditions, distinctive marks..."
                                    rows={4}
                                />
                            </div>

                            <footer className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>
                                    Discard Changes
                                </button>
                                <button type="submit" className="btn-premium">
                                    {editingCattle ? 'Save Data' : 'Initialize Registry'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CattleRoster;
