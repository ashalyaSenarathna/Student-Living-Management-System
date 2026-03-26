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

// Health Management Imports
import StudentMedicalPanel from './pages/HealthManagement/StudentMedicalPanel';
import AppointmentBooking from './pages/HealthManagement/AppointmentBooking';
import MyAppointments from './pages/HealthManagement/MyAppointments';
import DoctorPortal from './pages/HealthManagement/DoctorPortal';
import PrescriptionPanel from './pages/HealthManagement/PrescriptionPanel';
import PharmacyAdmin from './pages/HealthManagement/PharmacyAdmin';

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

                {/* Hostel Owner Dashboard */}
                <Route path="/hostel-owner" element={
                    <ProtectedRoute allowedRoles={['HOSTEL_OWNER', 'ADMIN']}>
                        <OwnerDashboard />
                    </ProtectedRoute>
                } />

                {/* Hostel Admin */}
                <Route path="/hostel-admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <HostelAdmin />
                    </ProtectedRoute>
                } />

                {/* Health Management - Student Routes */}
                <Route path="/health/medical-panel" element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <StudentMedicalPanel />
                    </ProtectedRoute>
                } />
                <Route path="/health/appointment-booking" element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <AppointmentBooking />
                    </ProtectedRoute>
                } />
                <Route path="/health/my-appointments" element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <MyAppointments />
                    </ProtectedRoute>
                } />
                <Route path="/health/prescriptions" element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <PrescriptionPanel />
                    </ProtectedRoute>
                } />

                {/* Health Management - Doctor Routes */}
                <Route path="/health/doctor-portal" element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <DoctorPortal />
                    </ProtectedRoute>
                } />

                {/* Health Management - Pharmacy Admin Routes */}
                <Route path="/health/pharmacy-admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <PharmacyAdmin />
                    </ProtectedRoute>
                } />
            </Routes>
        </div>
    );
}

export default App;
