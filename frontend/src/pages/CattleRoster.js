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
    MapPin
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

    // Navigate to LiveMap with collar highlighted
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
            alert('Failed to save. Please try again.');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/api/cattle/${id}`);
            fetchCattle();
        } catch (error) {
            console.error('Error deleting cattle:', error);
            alert('Failed to delete. Please try again.');
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
        <div className="cattle-roster">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Cattle Roster</h2>
                    <p className="text-secondary">Manage your herd registry</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> Add Cattle
                </button>
            </div>

            {/* Search */}
            <div className="card">
                <div className="search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, tag, or breed..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Tag Number</th>
                                <th>Breed</th>
                                <th>Gender</th>
                                <th>Birth Date</th>
                                <th>Weight</th>
                                <th>Collar Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCattle.map(cow => (
                                <tr key={cow.id}>
                                    <td><strong>{cow.name || 'Unnamed'}</strong></td>
                                    <td>{cow.tag_number || '-'}</td>
                                    <td>{cow.breed || '-'}</td>
                                    <td>{cow.gender || '-'}</td>
                                    <td>{cow.birth_date ? new Date(cow.birth_date).toLocaleDateString() : '-'}</td>
                                    <td>{cow.weight_kg ? `${cow.weight_kg} kg` : '-'}</td>
                                    <td>
                                        {cow.assigned_collar_id ? (
                                            <span className="badge badge-success">
                                                <Radio size={12} /> #{cow.assigned_collar_id}
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning">No Collar</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {cow.assigned_collar_id && (
                                                <button
                                                    className="btn btn-icon btn-primary"
                                                    onClick={() => handleLocate(cow.assigned_collar_id)}
                                                    title="Locate on map"
                                                >
                                                    <MapPin size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => openEditModal(cow)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-icon btn-danger"
                                                onClick={() => handleDelete(cow.id, cow.name)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCattle.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="empty-table">
                                        {cattle.length === 0
                                            ? 'No cattle registered yet. Click "Add Cattle" to get started.'
                                            : 'No cattle match your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h3>{editingCattle ? 'Edit Cattle' : 'Add New Cattle'}</h3>
                            <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Bessie"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tag Number</label>
                                    <input
                                        type="text"
                                        name="tag_number"
                                        value={formData.tag_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g., TAG-001"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Breed</label>
                                    <input
                                        type="text"
                                        name="breed"
                                        value={formData.breed}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Holstein"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select...</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Birth Date</label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight_kg"
                                        value={formData.weight_kg}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 450"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any additional notes..."
                                    rows={3}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCattle ? 'Save Changes' : 'Add Cattle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CattleRoster;
