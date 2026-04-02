import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/UserManagement/Login';
import Register from './pages/UserManagement/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import LaundryList from './pages/LaundryManagement/LaundryList';
import LaundryDetails from './pages/LaundryManagement/LaundryDetails';
import AddLaundry from './pages/LaundryManagement/AddLaundry';
import ManageBookings from './pages/LaundryManagement/ManageBookings';
import MyBookings from './pages/LaundryManagement/MyBookings';
import Profile from './pages/UserManagement/Profile';
import HostelManagement from './pages/HostelManagement/HostelManagement';
import HostelDetails from './pages/HostelManagement/HostelDetails';
import OwnerDashboard from './pages/HostelManagement/OwnerDashboard';
import HostelAdmin from './pages/HostelManagement/HostelAdmin';
import FoodList from './pages/FoodManagement/FoodList';
import FoodDetails from './pages/FoodManagement/FoodDetails';
import AddFood from './pages/FoodManagement/AddFood';
import ManageFoodOrders from './pages/FoodManagement/ManageFoodOrders';
import ManageMealPlans from './pages/FoodManagement/ManageMealPlans';
import MyFoodOrders from './pages/FoodManagement/MyFoodOrders';
import MyMealPlans from './pages/FoodManagement/MyMealPlans';
import FoodAdminDashboard from './pages/FoodManagement/FoodAdminDashboard';
import './App.css';
import './light-mode.css'; // Global light mode overrides

import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = userInfo.role?.toUpperCase();

    if (!userInfo || !userInfo.token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <div className="App">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/hostel" element={<HostelManagement />} />
                <Route path="/hostel/:id" element={<HostelDetails />} />
                <Route path="/profile" element={<Profile />} />

                {/* Restricted Laundry Routes */}
                <Route path="/laundry" element={
                    <ProtectedRoute allowedRoles={['USER', 'PROVIDER', 'ADMIN']}>
                        <LaundryList />
                    </ProtectedRoute>
                } />
                <Route path="/laundry/:id" element={
                    <ProtectedRoute allowedRoles={['USER', 'PROVIDER', 'ADMIN']}>
                        <LaundryDetails />
                    </ProtectedRoute>
                } />
                <Route path="/add-laundry" element={
                    <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                        <AddLaundry />
                    </ProtectedRoute>
                } />
                <Route path="/manage-bookings" element={
                    <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                        <ManageBookings />
                    </ProtectedRoute>
                } />
                <Route path="/my-bookings" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <MyBookings />
                    </ProtectedRoute>
                } />

                {/* Food Management Routes */}
                <Route path="/food" element={
                    <ProtectedRoute allowedRoles={['USER', 'FOOD_PROVIDER', 'ADMIN']}>
                        <FoodList />
                    </ProtectedRoute>
                } />
                <Route path="/food/:id" element={
                    <ProtectedRoute allowedRoles={['USER', 'FOOD_PROVIDER', 'ADMIN']}>
                        <FoodDetails />
                    </ProtectedRoute>
                } />
                <Route path="/add-food" element={
                    <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']}>
                        <AddFood />
                    </ProtectedRoute>
                } />
                <Route path="/manage-food-orders" element={
                    <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']}>
                        <ManageFoodOrders />
                    </ProtectedRoute>
                } />
                <Route path="/manage-meal-plans" element={
                    <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']}>
                        <ManageMealPlans />
                    </ProtectedRoute>
                } />
                <Route path="/my-food-orders" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <MyFoodOrders />
                    </ProtectedRoute>
                } />
                <Route path="/my-meal-plans" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <MyMealPlans />
                    </ProtectedRoute>
                } />

                {/* Hostel Owner Dashboard */}
                <Route path="/hostel-owner" element={
                    <ProtectedRoute allowedRoles={['HOSTEL_OWNER', 'ADMIN']}>
                        <OwnerDashboard />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/food-admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <FoodAdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/hostel-admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <HostelAdmin />
                    </ProtectedRoute>
                } />
            </Routes>
        </div>
    );
}

export default App;
