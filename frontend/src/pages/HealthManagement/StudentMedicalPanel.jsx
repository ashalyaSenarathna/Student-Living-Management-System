import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    AlertCircle,
    ClipboardList,
    Package,
    Search,
    ShieldAlert,
    ShoppingCart,
    Upload,
    X
} from 'lucide-react';
import './StudentMedicalPanel.css';

const MAX_PRESCRIPTION_SIZE = 5 * 1024 * 1024;
const ACCEPTED_PRESCRIPTION_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MEDICAL_CART_STORAGE_KEY = 'health_medical_cart';

const formatCategory = (category = '') => category
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const formatCurrency = (value = 0) => `Rs. ${Number(value).toFixed(2)}`;

const formatDate = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleDateString();
};

const getStatusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const StudentMedicalPanel = () => {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [deliveryType, setDeliveryType] = useState('Pickup');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [quantityInputs, setQuantityInputs] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [prescriptionFile, setPrescriptionFile] = useState(null);

    const API_URL = 'http://localhost:5000/api/health';
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    useEffect(() => {
        fetchPharmaceuticals();
        fetchOrders();
    }, []);

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(MEDICAL_CART_STORAGE_KEY);
            if (!storedCart) return;

            const parsedCart = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
                setCart(parsedCart);
            }
        } catch (storageError) {
            console.error('Failed to restore medical cart:', storageError);
        }
    }, []);

    useEffect(() => {
        try {
            if (cart.length === 0) {
                localStorage.removeItem(MEDICAL_CART_STORAGE_KEY);
                return;
            }

            localStorage.setItem(MEDICAL_CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (storageError) {
            console.error('Failed to persist medical cart:', storageError);
        }
    }, [cart]);

    const fetchPharmaceuticals = async () => {
        try {
            const response = await axios.get(`${API_URL}/pharmaceutical`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load medical inventory.');
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.data || []);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
    };

    const filteredItems = useMemo(() => items.filter(item => {
        const matchesSearch = [
            item.name,
            formatCategory(item.category),
            item.dosage,
            item.manufacturer
        ].filter(Boolean).some(value => value.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        return matchesSearch && matchesType;
    }), [items, searchTerm, typeFilter]);

    const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
    const criticalCartItems = useMemo(() => cart.filter(item => item.type === 'Critical'), [cart]);
    const requiresPrescription = criticalCartItems.length > 0;

    useEffect(() => {
        if (items.length === 0) return;

        setCart(prev => prev
            .map(cartItem => {
                const sourceItem = items.find(item => item._id === cartItem._id);
                if (!sourceItem) return null;

                return {
                    ...sourceItem,
                    quantity: Math.min(cartItem.quantity, Math.max(sourceItem.stockQuantity, 0), 100)
                };
            })
            .filter(item => item && item.quantity > 0)
        );
    }, [items]);

    const setQuantityInput = (itemId, value) => {
        const numericValue = value === '' ? '' : Math.max(0, Number(value));
        setQuantityInputs(prev => ({
            ...prev,
            [itemId]: numericValue
        }));
    };

    const addToCart = (item) => {
        const requestedQuantity = Number(quantityInputs[item._id] || 0);

        if (!requestedQuantity || requestedQuantity < 1) {
            setError(`Enter a valid quantity for ${item.name} before adding it to the cart.`);
            return;
        }

        if (requestedQuantity > 100) {
            setError('Quantity cannot exceed 100 units per item.');
            return;
        }

        if (requestedQuantity > item.stockQuantity) {
            setError(`Only ${item.stockQuantity} units of ${item.name} are currently available.`);
            return;
        }

        setError('');
        setCart(prev => {
            const existingItem = prev.find(entry => entry._id === item._id);
            if (existingItem) {
                const updatedQuantity = existingItem.quantity + requestedQuantity;
                if (updatedQuantity > 100 || updatedQuantity > item.stockQuantity) {
                    setError(`You cannot add more than ${Math.min(item.stockQuantity, 100)} units of ${item.name}.`);
                    return prev;
                }

                return prev.map(entry => (
                    entry._id === item._id
                        ? { ...entry, quantity: updatedQuantity }
                        : entry
                ));
            }

            return [...prev, { ...item, quantity: requestedQuantity }];
        });

        setQuantityInputs(prev => ({
            ...prev,
            [item._id]: ''
        }));
    };

    const updateCartQuantity = (itemId, quantity) => {
        if (!Number.isFinite(quantity)) {
            return;
        }

        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        const sourceItem = items.find(item => item._id === itemId);
        const maxAllowed = Math.min(sourceItem?.stockQuantity ?? 100, 100);

        if (quantity > maxAllowed) {
            setError(`Quantity cannot exceed ${maxAllowed} for this item.`);
            return;
        }

        setError('');
        setCart(prev => prev.map(item => (
            item._id === itemId ? { ...item, quantity } : item
        )));
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item._id !== itemId));
    };

    const handlePrescriptionChange = (file) => {
        if (!file) {
            setPrescriptionFile(null);
            return;
        }

        if (file.size > MAX_PRESCRIPTION_SIZE) {
            setError('Prescription file size must be less than 5MB.');
            return;
        }

        if (!ACCEPTED_PRESCRIPTION_TYPES.includes(file.type)) {
            setError('Upload a PDF, JPG, or PNG prescription file.');
            return;
        }

        setError('');
        setPrescriptionFile(file);
    };

    const validateOrder = () => {
        if (cart.length === 0) {
            setError('Add at least one item to the cart before placing an order.');
            return false;
        }

        if (deliveryType === 'Room Delivery' && !deliveryAddress.trim()) {
            setError('Enter the delivery address for room delivery.');
            return false;
        }

        if (requiresPrescription && !prescriptionFile) {
            setError('Upload a prescription before ordering critical items.');
            return false;
        }

        setError('');
        return true;
    };

    const submitOrder = async () => {
        if (!validateOrder()) return;

        try {
            setSubmitting(true);

            let serializedPrescription = null;
            if (requiresPrescription && prescriptionFile) {
                const dataUrl = await readFileAsDataUrl(prescriptionFile);
                serializedPrescription = JSON.stringify({
                    name: prescriptionFile.name,
                    type: prescriptionFile.type,
                    size: prescriptionFile.size,
                    uploadedAt: new Date().toISOString(),
                    dataUrl
                });
            }

            const orderData = {
                items: cart.map(item => ({
                    pharmaceuticalId: item._id,
                    quantity: item.quantity
                })),
                deliveryType,
                deliveryAddress: deliveryType === 'Room Delivery' ? deliveryAddress.trim() : null,
                prescriptionFile: serializedPrescription
            };

            await axios.post(`${API_URL}/orders`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCart([]);
            setPrescriptionFile(null);
            setDeliveryAddress('');
            setDeliveryType('Pickup');
            setShowCart(false);
            setError('');
            await Promise.all([fetchOrders(), fetchPharmaceuticals()]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setSubmitting(false);
        }
    };

    const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    if (loading) {
        return (
            <div className="medical-panel-page">
                <div className="medical-panel-shell medical-loading-state">
                    <div className="medical-spinner" />
                    <p>Loading medical inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="medical-panel-page">
            <div className="medical-panel-shell">
                <section className="medical-hero">
                    <div className="medical-hero-copy">
                        <span className="medical-eyebrow">Student Health Hub</span>
                        <h1>Medical Pharmacy Panel</h1>
                        <p>
                            Review current medicine availability, choose your quantity first, and complete
                            your order from a focused cart overlay.
                        </p>
                    </div>

                    <div className="medical-hero-actions">
                        <div className="medical-stat-card">
                            <span className="medical-stat-label">Available items</span>
                            <strong>{items.length}</strong>
                        </div>
                        <div className="medical-stat-card">
                            <span className="medical-stat-label">Critical items</span>
                            <strong>{items.filter(item => item.type === 'Critical').length}</strong>
                        </div>
                        <button
                            type="button"
                            className="medical-cart-trigger"
                            onClick={() => setShowCart(true)}
                        >
                            <ShoppingCart size={18} />
                            <span>Cart</span>
                            <strong>{cartCount}</strong>
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="medical-alert medical-alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <section className="medical-toolbar">
                    <div className="medical-search">
                        <Search size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by medicine, dosage, manufacturer, or category"
                        />
                    </div>

                    <div className="medical-filter-group">
                        {['All', 'Normal', 'Critical'].map(filter => (
                            <button
                                key={filter}
                                type="button"
                                className={`medical-filter-pill ${typeFilter === filter ? 'active' : ''}`}
                                onClick={() => setTypeFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="medical-content-card">
                    <div className="medical-section-heading">
                        <div>
                            <span className="medical-section-kicker">Inventory</span>
                            <h2>Available medicines and supplies</h2>
                        </div>
                        <p>{filteredItems.length} item(s) match your current view</p>
                    </div>

                    <div className="medical-table-wrapper">
                        <table className="medical-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Category</th>
                                    <th>Dosage</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="medical-empty-row">
                                            No medicines match the current filters.
                                        </td>
                                    </tr>
                                )}

                                {filteredItems.map(item => {
                                    const enteredQuantity = Number(quantityInputs[item._id] || 0);
                                    const isOutOfStock = item.availability === 'Out of Stock' || item.stockQuantity === 0;
                                    const canAdd = enteredQuantity > 0 && enteredQuantity <= Math.min(item.stockQuantity, 100) && !isOutOfStock;
                                    const cartItem = cart.find(entry => entry._id === item._id);

                                    return (
                                        <tr key={item._id}>
                                            <td>
                                                <div className="medicine-main">
                                                    <strong>{item.name}</strong>
                                                    <span>{item.description || item.manufacturer || 'Student medical center stock item'}</span>
                                                </div>
                                            </td>
                                            <td>{formatCategory(item.category)}</td>
                                            <td>{item.dosage}</td>
                                            <td className="medical-price">{formatCurrency(item.price)}</td>
                                            <td>
                                                <div className="stock-cell">
                                                    <span className={`stock-pill ${getStatusClass(item.availability)}`}>
                                                        {item.availability}
                                                    </span>
                                                    <small>{item.stockQuantity} left</small>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`type-pill ${item.type === 'Critical' ? 'critical' : 'normal'}`}>
                                                    {item.type === 'Critical' && <ShieldAlert size={14} />}
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={Math.min(item.stockQuantity, 100)}
                                                    value={quantityInputs[item._id] ?? ''}
                                                    onChange={(e) => setQuantityInput(item._id, e.target.value)}
                                                    className="medical-qty-input"
                                                    placeholder="Qty"
                                                    disabled={isOutOfStock}
                                                />
                                            </td>
                                            <td>
                                                <div className="action-cell">
                                                    <button
                                                        type="button"
                                                        className="medical-add-btn"
                                                        onClick={() => addToCart(item)}
                                                        disabled={!canAdd}
                                                    >
                                                        Add to cart
                                                    </button>
                                                    {cartItem && (
                                                        <small className="action-note">
                                                            In cart: {cartItem.quantity}
                                                        </small>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="medical-content-card">
                    <div className="medical-section-heading">
                        <div>
                            <span className="medical-section-kicker">Order history</span>
                            <h2>Your recent orders</h2>
                        </div>
                        <ClipboardList size={18} />
                    </div>

                    {orders.length === 0 ? (
                        <div className="medical-empty-state">
                            <Package size={28} />
                            <div>
                                <strong>No orders yet</strong>
                                <p>Your submitted medical orders will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="medical-table-wrapper">
                            <table className="medical-table orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Delivery</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td>{order.orderId}</td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>{order.items?.length || 0}</td>
                                            <td className="medical-price">{formatCurrency(order.totalAmount)}</td>
                                            <td>
                                                <span className={`order-status-pill ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{order.deliveryType}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {showCart && (
                <div className="medical-cart-overlay" onClick={() => setShowCart(false)}>
                    <div className="medical-cart-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="medical-cart-header">
                            <div>
                                <span className="medical-section-kicker">Checkout</span>
                                <h2>Your cart</h2>
                            </div>
                            <button
                                type="button"
                                className="medical-close-btn"
                                onClick={() => setShowCart(false)}
                                aria-label="Close cart"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {cart.length === 0 ? (
                            <div className="medical-empty-state in-modal">
                                <ShoppingCart size={28} />
                                <div>
                                    <strong>Your cart is empty</strong>
                                    <p>Select a quantity in the table, then add an item to continue.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="medical-cart-items">
                                    {cart.map(item => (
                                        <div key={item._id} className="medical-cart-item">
                                            <div className="medical-cart-item-main">
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span>{item.dosage} • {formatCategory(item.category)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="medical-remove-btn"
                                                    onClick={() => removeFromCart(item._id)}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="medical-cart-item-controls">
                                                <label>
                                                    Qty
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={Math.min(item.stockQuantity, 100)}
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item._id, Number(e.target.value))}
                                                    />
                                                </label>
                                                <div className="medical-cart-item-price">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {requiresPrescription && (
                                    <div className="medical-upload-card">
                                        <div className="medical-upload-copy">
                                            <ShieldAlert size={18} />
                                            <div>
                                                <strong>Prescription required</strong>
                                                <p>
                                                    Your cart contains one or more critical medicines. Upload a valid
                                                    prescription before placing the order.
                                                </p>
                                            </div>
                                        </div>
                                        <label className="medical-file-picker">
                                            <Upload size={16} />
                                            <span>{prescriptionFile ? prescriptionFile.name : 'Upload prescription (PDF/JPG/PNG)'}</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handlePrescriptionChange(e.target.files?.[0])}
                                            />
                                        </label>
                                    </div>
                                )}

                                <div className="medical-checkout-grid">
                                    <div className="medical-checkout-card">
                                        <h3>Delivery method</h3>
                                        <div className="medical-radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="deliveryType"
                                                    value="Pickup"
                                                    checked={deliveryType === 'Pickup'}
                                                    onChange={(e) => setDeliveryType(e.target.value)}
                                                />
                                                <span>Pickup from medical center</span>
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="deliveryType"
                                                    value="Room Delivery"
                                                    checked={deliveryType === 'Room Delivery'}
                                                    onChange={(e) => setDeliveryType(e.target.value)}
                                                />
                                                <span>Room delivery</span>
                                            </label>
                                        </div>

                                        {deliveryType === 'Room Delivery' && (
                                            <textarea
                                                className="medical-address-input"
                                                value={deliveryAddress}
                                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                                placeholder="Enter hostel / room / contact delivery details"
                                            />
                                        )}
                                    </div>

                                    <div className="medical-checkout-card summary-card">
                                        <h3>Order summary</h3>
                                        <div className="summary-line">
                                            <span>Distinct items</span>
                                            <strong>{cart.length}</strong>
                                        </div>
                                        <div className="summary-line">
                                            <span>Total quantity</span>
                                            <strong>{cartCount}</strong>
                                        </div>
                                        <div className="summary-line">
                                            <span>Critical medicines</span>
                                            <strong>{criticalCartItems.length}</strong>
                                        </div>
                                        <div className="summary-line total">
                                            <span>Total amount</span>
                                            <strong>{formatCurrency(getTotalPrice())}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="medical-place-order-btn"
                                            onClick={submitOrder}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Placing order...' : 'Place order'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentMedicalPanel;
