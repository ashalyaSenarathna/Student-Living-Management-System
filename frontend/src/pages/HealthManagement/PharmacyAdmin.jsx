import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Box, Package, Pill, Plus, RefreshCw, SquarePen, Trash2, X } from 'lucide-react';
import './PharmacyAdmin.css';

const HEALTH_API_URL = 'http://localhost:5000/api/health';

const formatCurrency = (value = 0) => `Rs. ${Number(value).toFixed(2)}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '--';
const getStatusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-');
const formatCategoryLabel = (value = '') => value.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

const CATEGORY_OPTIONS = [
    'pain_reliever',
    'antibiotics',
    'antacid',
    'cold_medicine',
    'vitamin',
    'topical',
    'other'
];

const TYPE_OPTIONS = ['Normal', 'Critical'];
const PRESCRIPTION_STATUS_OPTIONS = ['ACTIVE', 'PARTIALLY_DISPENSED', 'DISPENSED', 'EXPIRED', 'CANCELLED'];

const createEmptyMedicineForm = () => ({
    name: '',
    category: 'other',
    type: 'Normal',
    dosage: '',
    price: '',
    stockQuantity: '',
    minStockLevel: '10',
    expiryDate: ''
});

const PharmacyAdmin = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [pharmaceuticals, setPharmaceuticals] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState(null);
    const [orderFilter, setOrderFilter] = useState('all');
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogMode, setCatalogMode] = useState('create');
    const [editingMedicineId, setEditingMedicineId] = useState(null);
    const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
    const [previewPrescriptionUrl, setPreviewPrescriptionUrl] = useState('');
    const [medicineForm, setMedicineForm] = useState(createEmptyMedicineForm());
    const [savingMedicine, setSavingMedicine] = useState(false);
    const [deletingMedicineId, setDeletingMedicineId] = useState(null);

    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
    const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setBanner(null);
            await Promise.all([
                fetchOrders(),
                fetchPrescriptions(),
                fetchInventory(),
                fetchPharmaceuticals()
            ]);
        } catch (error) {
            setBanner({ type: 'error', message: 'Failed to load pharmacy admin data.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        const response = await axios.get(`${HEALTH_API_URL}/orders/admin/all`, authConfig);
        const orderData = response.data.data || [];
        setOrders(orderData);
        setSelectedOrder(prev => orderData.find(item => item._id === prev?._id) || orderData[0] || null);
    };

    const fetchPrescriptions = async () => {
        const response = await axios.get(`${HEALTH_API_URL}/prescriptions/admin/all`, authConfig);
        setPrescriptions(response.data.data || []);
    };

    const fetchInventory = async () => {
        const response = await axios.get(`${HEALTH_API_URL}/inventory`, authConfig);
        setInventory(response.data.data || []);
    };

    const fetchPharmaceuticals = async () => {
        const response = await axios.get(`${HEALTH_API_URL}/pharmaceutical`);
        setPharmaceuticals(response.data.data || []);
    };

    const refreshCatalogData = async () => {
        await Promise.all([fetchInventory(), fetchPharmaceuticals()]);
    };

    const resetMedicineForm = () => {
        setCatalogMode('create');
        setEditingMedicineId(null);
        setMedicineForm(createEmptyMedicineForm());
        setIsMedicineModalOpen(false);
    };

    const startEditMedicine = (medicine) => {
        setCatalogMode('edit');
        setEditingMedicineId(medicine._id);
        setIsMedicineModalOpen(true);
        setMedicineForm({
            name: medicine.name || '',
            category: medicine.category || 'other',
            type: medicine.type || 'Normal',
            dosage: medicine.dosage || '',
            price: medicine.price ?? '',
            stockQuantity: medicine.stockQuantity ?? '',
            minStockLevel: medicine.minStockLevel ?? 10,
            expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : ''
        });
        setBanner(null);
        setActiveTab('inventory');
    };

    const startCreateMedicine = () => {
        setCatalogMode('create');
        setEditingMedicineId(null);
        setMedicineForm(createEmptyMedicineForm());
        setIsMedicineModalOpen(true);
        setBanner(null);
        setActiveTab('inventory');
    };

    const handleMedicineFieldChange = (event) => {
        const { name, value } = event.target;
        setMedicineForm(prev => ({ ...prev, [name]: value }));
    };

    const validateMedicineForm = () => {
        if (!medicineForm.name.trim() || !medicineForm.dosage.trim() || !medicineForm.expiryDate) {
            return 'Medicine name, dosage, and expiry date are required.';
        }

        const price = Number(medicineForm.price);
        const stockQuantity = Number(medicineForm.stockQuantity);
        const minStockLevel = Number(medicineForm.minStockLevel);

        if (Number.isNaN(price) || price < 0) {
            return 'Price must be a valid non-negative value.';
        }

        if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
            return 'Stock quantity must be a valid non-negative number.';
        }

        if (Number.isNaN(minStockLevel) || minStockLevel < 0) {
            return 'Minimum stock level must be zero or higher.';
        }

        return '';
    };

    const buildMedicinePayload = () => ({
        name: medicineForm.name.trim(),
        category: medicineForm.category,
        type: medicineForm.type,
        dosage: medicineForm.dosage.trim(),
        price: Number(medicineForm.price),
        stockQuantity: Number(medicineForm.stockQuantity),
        minStockLevel: Number(medicineForm.minStockLevel),
        minThreshold: Number(medicineForm.minStockLevel),
        expiryDate: medicineForm.expiryDate
    });

    const resolvePrescriptionUrl = (filePath) => {
        if (!filePath) return '';
        return filePath.startsWith('http') ? filePath : `http://localhost:5000${filePath}`;
    };

    const isPdfFile = (filePath = '') => filePath.toLowerCase().endsWith('.pdf');

    const handleSaveMedicine = async (event) => {
        event.preventDefault();

        const validationMessage = validateMedicineForm();
        if (validationMessage) {
            setBanner({ type: 'error', message: validationMessage });
            return;
        }

        try {
            setSavingMedicine(true);
            setBanner(null);
            const payload = buildMedicinePayload();

            if (catalogMode === 'edit' && editingMedicineId) {
                await axios.put(`${HEALTH_API_URL}/pharmaceutical/${editingMedicineId}`, payload, authConfig);
                setBanner({ type: 'success', message: 'Medicine updated successfully.' });
            } else {
                await axios.post(`${HEALTH_API_URL}/pharmaceutical`, payload, authConfig);
                setBanner({ type: 'success', message: 'Medicine created successfully.' });
            }

            await refreshCatalogData();
            resetMedicineForm();
        } catch (error) {
            setBanner({ type: 'error', message: error.response?.data?.message || 'Failed to save medicine.' });
        } finally {
            setSavingMedicine(false);
        }
    };

    const handleDeleteMedicine = async (medicineId) => {
        if (!window.confirm('Remove this pharmaceutical item from the catalog?')) {
            return;
        }

        try {
            setDeletingMedicineId(medicineId);
            setBanner(null);
            await axios.delete(`${HEALTH_API_URL}/pharmaceutical/${medicineId}`, authConfig);
            await refreshCatalogData();

            if (editingMedicineId === medicineId) {
                resetMedicineForm();
            }

            setBanner({ type: 'success', message: 'Medicine removed successfully.' });
        } catch (error) {
            setBanner({ type: 'error', message: error.response?.data?.message || 'Failed to remove medicine.' });
        } finally {
            setDeletingMedicineId(null);
        }
    };

    const updatePrescriptionStatus = async (prescriptionId, status) => {
        try {
            setBanner(null);
            await axios.put(`${HEALTH_API_URL}/prescriptions/${prescriptionId}/status`, { status }, authConfig);
            await fetchPrescriptions();
            setBanner({ type: 'success', message: `Prescription marked as ${status}.` });
        } catch (error) {
            setBanner({ type: 'error', message: error.response?.data?.message || 'Failed to update prescription status.' });
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            setBanner(null);
            await axios.put(`${HEALTH_API_URL}/orders/${orderId}/status`, { status }, authConfig);
            await fetchOrders();
            setBanner({ type: 'success', message: `Order marked as ${status}.` });
        } catch (error) {
            setBanner({ type: 'error', message: error.response?.data?.message || 'Failed to update order.' });
        }
    };

    const filteredOrders = useMemo(() => {
        if (orderFilter === 'all') {
            return orders;
        }
        return orders.filter(order => order.status.toLowerCase() === orderFilter.toLowerCase());
    }, [orders, orderFilter]);

    const activePrescriptions = useMemo(
        () => prescriptions.filter(prescription => prescription.status === 'ACTIVE'),
        [prescriptions]
    );

    const inventoryByPharmaceuticalId = useMemo(
        () => new Map(inventory.map(item => [item.pharmaceutical?._id, item])),
        [inventory]
    );

    const catalogRows = useMemo(() => {
        const normalizedSearch = catalogSearch.trim().toLowerCase();

        return pharmaceuticals.filter(pharma => (
            !normalizedSearch ||
            pharma.name?.toLowerCase().includes(normalizedSearch) ||
            pharma.category?.toLowerCase().includes(normalizedSearch) ||
            pharma.dosage?.toLowerCase().includes(normalizedSearch) ||
            pharma.type?.toLowerCase().includes(normalizedSearch)
        ));
    }, [catalogSearch, pharmaceuticals]);

    const lowStockItems = useMemo(
        () => inventory.filter(item => item.currentStock <= item.minThreshold),
        [inventory]
    );

    if (loading) {
        return (
            <div className="pharmacy-admin-page">
                <div className="pharmacy-admin-shell pharmacy-admin-loading-state">
                    <div className="pharmacy-admin-spinner" />
                    <p>Loading pharmacy admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pharmacy-admin-page">
            <div className="pharmacy-admin-shell">
                <section className="pharmacy-admin-hero">
                    <div className="pharmacy-admin-hero-copy">
                        <span className="pharmacy-admin-eyebrow">Pharmacy Operations</span>
                        <h1>Pharmacy admin dashboard</h1>
                        <p>
                            Review orders, track active prescriptions, and manage the pharmaceutical catalog
                            with a lighter admin workflow.
                        </p>
                    </div>

                    <div className="pharmacy-admin-stats">
                        <div className="pharmacy-admin-stat-card">
                            <span>Orders</span>
                            <strong>{orders.length}</strong>
                        </div>
                        <div className="pharmacy-admin-stat-card">
                            <span>Active prescriptions</span>
                            <strong>{activePrescriptions.length}</strong>
                        </div>
                        <div className="pharmacy-admin-stat-card">
                            <span>Medicines</span>
                            <strong>{pharmaceuticals.length}</strong>
                        </div>
                        <div className="pharmacy-admin-stat-card">
                            <span>Low stock items</span>
                            <strong>{lowStockItems.length}</strong>
                        </div>
                    </div>
                </section>

                {banner && (
                    <div className={`pharmacy-admin-alert ${banner.type === 'error' ? 'pharmacy-admin-alert-error' : 'pharmacy-admin-alert-success'}`}>
                        <AlertCircle size={18} />
                        <span>{banner.message}</span>
                    </div>
                )}

                <section className="pharmacy-admin-tabbar">
                    <button type="button" className={`pharmacy-admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                        <Package size={18} />
                        Orders ({orders.length})
                    </button>
                    <button type="button" className={`pharmacy-admin-tab ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
                        <Pill size={18} />
                        Prescriptions ({activePrescriptions.length})
                    </button>
                    <button type="button" className={`pharmacy-admin-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                        <Box size={18} />
                        Catalog ({pharmaceuticals.length})
                    </button>
                </section>

                {activeTab === 'orders' && (
                    <section className="pharmacy-admin-content-card">
                        <div className="pharmacy-admin-section-head">
                            <div>
                                <span className="pharmacy-admin-section-kicker">Orders</span>
                                <h2>Orders management</h2>
                            </div>
                            <div className="pharmacy-admin-filter-group">
                                {['all', 'pending', 'approved', 'ready', 'delivered'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={`pharmacy-admin-filter-pill ${orderFilter === status ? 'active' : ''}`}
                                        onClick={() => setOrderFilter(status)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pharmacy-admin-two-column">
                            <div className="pharmacy-admin-table-card">
                                {filteredOrders.length === 0 ? (
                                    <div className="pharmacy-admin-empty-state">
                                        <Package size={26} />
                                        <div>
                                            <strong>No orders found</strong>
                                            <p>There are no orders in the selected filter.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pharmacy-admin-table-wrap">
                                        <table className="pharmacy-admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Student</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map(order => (
                                                    <tr
                                                        key={order._id}
                                                        className={selectedOrder?._id === order._id ? 'selected' : ''}
                                                        onClick={() => setSelectedOrder(order)}
                                                    >
                                                        <td>{order.orderId}</td>
                                                        <td>{order.student?.name}</td>
                                                        <td>{formatDate(order.createdAt)}</td>
                                                        <td>{formatCurrency(order.totalAmount)}</td>
                                                        <td>
                                                            <span className={`pharmacy-admin-status-pill ${getStatusClass(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="pharmacy-admin-detail-card">
                                {selectedOrder ? (
                                    <>
                                        <div className="pharmacy-admin-detail-head">
                                            <div>
                                                <span className="pharmacy-admin-section-kicker">Order detail</span>
                                                <h2>{selectedOrder.orderId}</h2>
                                            </div>
                                            <button type="button" className="pharmacy-admin-close-btn" onClick={() => setSelectedOrder(null)}>
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <div className="pharmacy-admin-detail-grid">
                                            <div className="pharmacy-admin-info-card">
                                                <span>Student</span>
                                                <strong>{selectedOrder.student?.name}</strong>
                                            </div>
                                            <div className="pharmacy-admin-info-card">
                                                <span>Email</span>
                                                <strong>{selectedOrder.student?.email}</strong>
                                            </div>
                                            <div className="pharmacy-admin-info-card">
                                                <span>Amount</span>
                                                <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                                            </div>
                                            <div className="pharmacy-admin-info-card">
                                                <span>Status</span>
                                                <strong>{selectedOrder.status}</strong>
                                            </div>
                                        </div>

                                        <div className="pharmacy-admin-note-block">
                                            <label>Items</label>
                                            <div className="pharmacy-admin-item-list">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={`${selectedOrder._id}-${idx}`} className="pharmacy-admin-item-card">
                                                        <strong>{item.pharmaceutical?.name}</strong>
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>Unit: {formatCurrency(item.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedOrder.prescriptionFile && (
                                            <div className="pharmacy-admin-note-block">
                                                <label>Prescription</label>
                                                <div className="pharmacy-admin-row-actions">
                                                    <button
                                                        type="button"
                                                        className="pharmacy-admin-btn info"
                                                        onClick={() => setPreviewPrescriptionUrl(resolvePrescriptionUrl(selectedOrder.prescriptionFile))}
                                                    >
                                                        Preview uploaded prescription
                                                    </button>
                                                    <a
                                                        className="pharmacy-admin-link-btn"
                                                        href={resolvePrescriptionUrl(selectedOrder.prescriptionFile)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Open in new tab
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                                            <div className="pharmacy-admin-action-stack">
                                                {selectedOrder.status === 'Pending' && (
                                                    <button type="button" className="pharmacy-admin-btn success" onClick={() => updateOrderStatus(selectedOrder._id, 'Approved')}>
                                                        Approve order
                                                    </button>
                                                )}
                                                {selectedOrder.status === 'Approved' && (
                                                    <button type="button" className="pharmacy-admin-btn info" onClick={() => updateOrderStatus(selectedOrder._id, 'Ready')}>
                                                        Mark ready
                                                    </button>
                                                )}
                                                {selectedOrder.status === 'Ready' && (
                                                    <>
                                                        <button type="button" className="pharmacy-admin-btn success" onClick={() => updateOrderStatus(selectedOrder._id, 'Delivered')}>
                                                            Mark delivered
                                                        </button>
                                                        <button type="button" className="pharmacy-admin-btn neutral" onClick={() => updateOrderStatus(selectedOrder._id, 'Picked Up')}>
                                                            Mark picked up
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="pharmacy-admin-empty-state">
                                        <Package size={26} />
                                        <div>
                                            <strong>Select an order</strong>
                                            <p>Choose an order from the list to review and update it.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'prescriptions' && (
                    <section className="pharmacy-admin-content-card">
                        <div className="pharmacy-admin-section-head">
                            <div>
                                <span className="pharmacy-admin-section-kicker">Prescriptions</span>
                                <h2>Active prescriptions</h2>
                            </div>
                        </div>

                        {prescriptions.length === 0 ? (
                            <div className="pharmacy-admin-empty-state">
                                <Pill size={26} />
                                <div>
                                    <strong>No prescriptions found</strong>
                                    <p>Prescriptions requiring pharmacy attention will appear here.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="pharmacy-admin-grid">
                                {prescriptions.map(prescription => (
                                    <article key={prescription._id} className="pharmacy-admin-card">
                                        <div className="pharmacy-admin-card-head">
                                            <div>
                                                <h3>{prescription.student?.name}</h3>
                                                <span>{prescription.prescriptionId}</span>
                                            </div>
                                            <span className={`pharmacy-admin-status-pill ${getStatusClass(prescription.status)}`}>
                                                {prescription.status}
                                            </span>
                                        </div>
                                        <p>Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</p>
                                        <p>{prescription.diagnosis}</p>
                                        <div className="pharmacy-admin-mini-list">
                                            {prescription.medicines.map((med, idx) => (
                                                <div key={`${prescription._id}-${idx}`} className="pharmacy-admin-mini-item">
                                                    <strong>{med.pharmaceutical?.name}</strong>
                                                    <span>{med.dosage} • {med.frequency}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pharmacy-admin-prescription-controls">
                                            <label className="pharmacy-admin-field">
                                                <span>Prescription status</span>
                                                <select
                                                    value={prescription.status}
                                                    onChange={(event) => updatePrescriptionStatus(prescription._id, event.target.value)}
                                                >
                                                    {PRESCRIPTION_STATUS_OPTIONS.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'inventory' && (
                    <section className="pharmacy-admin-content-card">
                        <div className="pharmacy-admin-section-head">
                            <div>
                                <span className="pharmacy-admin-section-kicker">Catalog</span>
                                <h2>Pharmaceutical catalog management</h2>
                            </div>
                            <div className="pharmacy-admin-toolbar">
                                <button type="button" className="pharmacy-admin-btn neutral" onClick={startCreateMedicine}>
                                    <Plus size={16} />
                                    New medicine
                                </button>
                                <button type="button" className="pharmacy-admin-btn neutral" onClick={refreshCatalogData}>
                                    <RefreshCw size={16} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {lowStockItems.length > 0 && (
                            <div className="pharmacy-admin-alert pharmacy-admin-alert-warning">
                                <AlertCircle size={18} />
                                <span>Low stock items detected: {lowStockItems.length}</span>
                            </div>
                        )}

                        <div className="pharmacy-admin-catalog-layout">
                            <div className="pharmacy-admin-table-card">
                                <div className="pharmacy-admin-catalog-tools">
                                    <input
                                        type="search"
                                        className="pharmacy-admin-search"
                                        placeholder="Search by medicine, category, dosage, or type"
                                        value={catalogSearch}
                                        onChange={(event) => setCatalogSearch(event.target.value)}
                                    />
                                </div>

                                <div className="pharmacy-admin-table-wrap">
                                    <table className="pharmacy-admin-table">
                                        <thead>
                                            <tr>
                                                <th>Medicine</th>
                                                <th>Category</th>
                                                <th>Type</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Expiry</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catalogRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8">
                                                        <div className="pharmacy-admin-empty-state pharmacy-admin-empty-state-inline">
                                                            <Box size={24} />
                                                            <div>
                                                                <strong>No medicines found</strong>
                                                                <p>Create a new medicine or change the search text.</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                catalogRows.map(pharma => {
                                                    const inventoryEntry = inventoryByPharmaceuticalId.get(pharma._id);
                                                    const stock = inventoryEntry?.currentStock ?? pharma.stockQuantity ?? 0;
                                                    const threshold = inventoryEntry?.minThreshold ?? pharma.minStockLevel ?? 0;
                                                    const status = stock === 0 ? 'Out of Stock' : stock <= threshold ? 'Low Stock' : 'Available';

                                                    return (
                                                        <tr key={pharma._id} className={editingMedicineId === pharma._id ? 'selected' : ''}>
                                                            <td>
                                                                <div className="pharmacy-admin-table-primary">
                                                                    <strong>{pharma.name}</strong>
                                                                    <span>{pharma.dosage}</span>
                                                                </div>
                                                            </td>
                                                            <td>{formatCategoryLabel(pharma.category)}</td>
                                                            <td>{pharma.type}</td>
                                                            <td>{formatCurrency(pharma.price)}</td>
                                                            <td>{stock}</td>
                                                            <td>{formatDate(pharma.expiryDate)}</td>
                                                            <td>
                                                                <span className={`pharmacy-admin-status-pill ${getStatusClass(status)}`}>
                                                                    {status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="pharmacy-admin-row-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="pharmacy-admin-icon-btn"
                                                                        onClick={() => startEditMedicine(pharma)}
                                                                    >
                                                                        <SquarePen size={16} />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="pharmacy-admin-icon-btn danger"
                                                                        disabled={deletingMedicineId === pharma._id}
                                                                        onClick={() => handleDeleteMedicine(pharma._id)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        {deletingMedicineId === pharma._id ? 'Deleting...' : 'Delete'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </section>
                )}
            </div>

            {isMedicineModalOpen && (
                <div className="pharmacy-admin-modal-overlay" onClick={resetMedicineForm}>
                    <div className="pharmacy-admin-modal-card" onClick={(event) => event.stopPropagation()}>
                        <div className="pharmacy-admin-detail-head">
                            <div>
                                <span className="pharmacy-admin-section-kicker">
                                    {catalogMode === 'edit' ? 'Update medicine' : 'Create medicine'}
                                </span>
                                <h2>{catalogMode === 'edit' ? 'Edit medicine' : 'Add medicine'}</h2>
                            </div>
                            <button type="button" className="pharmacy-admin-close-btn" onClick={resetMedicineForm}>
                                <X size={18} />
                            </button>
                        </div>

                        <form className="pharmacy-admin-form" onSubmit={handleSaveMedicine}>
                            <div className="pharmacy-admin-form-grid">
                                <label className="pharmacy-admin-field pharmacy-admin-field-wide">
                                    <span>Medicine name</span>
                                    <input name="name" value={medicineForm.name} onChange={handleMedicineFieldChange} />
                                </label>
                                <label className="pharmacy-admin-field">
                                    <span>Category</span>
                                    <select name="category" value={medicineForm.category} onChange={handleMedicineFieldChange}>
                                        {CATEGORY_OPTIONS.map(option => (
                                            <option key={option} value={option}>{formatCategoryLabel(option)}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="pharmacy-admin-field">
                                    <span>Type</span>
                                    <select name="type" value={medicineForm.type} onChange={handleMedicineFieldChange}>
                                        {TYPE_OPTIONS.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="pharmacy-admin-field">
                                    <span>Dosage</span>
                                    <input name="dosage" value={medicineForm.dosage} onChange={handleMedicineFieldChange} placeholder="500mg" />
                                </label>
                                <label className="pharmacy-admin-field">
                                    <span>Price (LKR)</span>
                                    <input name="price" type="number" min="0" step="0.01" value={medicineForm.price} onChange={handleMedicineFieldChange} />
                                </label>
                                <label className="pharmacy-admin-field">
                                    <span>Stock quantity</span>
                                    <input name="stockQuantity" type="number" min="0" step="1" value={medicineForm.stockQuantity} onChange={handleMedicineFieldChange} />
                                </label>
                                <label className="pharmacy-admin-field">
                                    <span>Min stock level</span>
                                    <input name="minStockLevel" type="number" min="0" step="1" value={medicineForm.minStockLevel} onChange={handleMedicineFieldChange} />
                                </label>
                                <label className="pharmacy-admin-field pharmacy-admin-field-wide">
                                    <span>Expiry date</span>
                                    <input
                                        name="expiryDate"
                                        type="date"
                                        value={medicineForm.expiryDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleMedicineFieldChange}
                                        onFocus={(event) => event.target.showPicker?.()}
                                    />
                                </label>
                            </div>

                            <div className="pharmacy-admin-form-actions">
                                <button type="submit" className="pharmacy-admin-btn success" disabled={savingMedicine}>
                                    {savingMedicine ? 'Saving...' : catalogMode === 'edit' ? 'Update medicine' : 'Create medicine'}
                                </button>
                                <button type="button" className="pharmacy-admin-btn neutral" onClick={resetMedicineForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewPrescriptionUrl && (
                <div className="pharmacy-admin-modal-overlay" onClick={() => setPreviewPrescriptionUrl('')}>
                    <div className="pharmacy-admin-modal-card pharmacy-admin-preview-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="pharmacy-admin-detail-head">
                            <div>
                                <span className="pharmacy-admin-section-kicker">Prescription preview</span>
                                <h2>Uploaded student prescription</h2>
                            </div>
                            <button type="button" className="pharmacy-admin-close-btn" onClick={() => setPreviewPrescriptionUrl('')}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="pharmacy-admin-preview-surface">
                            {isPdfFile(previewPrescriptionUrl) ? (
                                <iframe title="Prescription preview" src={previewPrescriptionUrl} className="pharmacy-admin-preview-frame" />
                            ) : (
                                <img src={previewPrescriptionUrl} alt="Prescription preview" className="pharmacy-admin-preview-image" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyAdmin;
