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
import StudentMedicalPanel from './pages/HealthManagement/StudentMedicalPanel';
import AppointmentBooking from './pages/HealthManagement/AppointmentBooking';
import MyAppointments from './pages/HealthManagement/MyAppointments';
import PrescriptionPanel from './pages/HealthManagement/PrescriptionPanel';
import DoctorPortal from './pages/HealthManagement/DoctorPortal';
import PharmacyAdmin from './pages/HealthManagement/PharmacyAdmin';

// Food Management Imports
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

                {/* Public Laundry Routes */}
                <Route path="/laundry" element={<LaundryList />} />
                <Route path="/laundry/:id" element={<LaundryDetails />} />
                <Route path="/add-laundry" element={
                    <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                        <AddLaundry />
                    </ProtectedRoute>
                } />
                <Route path="/edit-laundry/:id" element={
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
                <Route path="/hostel-admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <HostelAdmin />
                    </ProtectedRoute>
                } />

                {/* Health Management Routes */}
                <Route path="/health/medical-panel" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'DOCTOR']}>
                        <StudentMedicalPanel />
                    </ProtectedRoute>
                } />
                <Route path="/health/appointment-booking" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <AppointmentBooking />
                    </ProtectedRoute>
                } />
                <Route path="/health/my-appointments" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <MyAppointments />
                    </ProtectedRoute>
                } />
                <Route path="/health/prescriptions" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <PrescriptionPanel />
                    </ProtectedRoute>
                } />
                <Route path="/health/doctor-portal" element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                        <DoctorPortal />
                    </ProtectedRoute>
                } />
                <Route path="/health/pharmacy-admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <PharmacyAdmin />
                    </ProtectedRoute>
                } />

                {/* Public Food Routes */}
                <Route path="/food" element={<FoodList />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/food/add" element={
                    <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']}>
                        <AddFood />
                    </ProtectedRoute>
                } />
                <Route path="/food/manage-orders" element={
                    <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']}>
                        <ManageFoodOrders />
                    </ProtectedRoute>
                } />
                <Route path="/food/manage-plans" element={
                    <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']}>
                        <ManageMealPlans />
                    </ProtectedRoute>
                } />
                <Route path="/food/my-orders" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <MyFoodOrders />
                    </ProtectedRoute>
                } />
                <Route path="/food/my-plans" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <MyMealPlans />
                    </ProtectedRoute>
                } />
                <Route path="/food/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <FoodAdminDashboard />
                    </ProtectedRoute>
                } />

            </Routes>
        </div>
    );
}

export default App;
