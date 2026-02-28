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
import './App.css';

function App() {
    return (
        <div className="App">
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/laundry" element={<LaundryList />} />
                <Route path="/laundry/:id" element={<LaundryDetails />} />
                <Route path="/add-laundry" element={<AddLaundry />} />
                <Route path="/manage-bookings" element={<ManageBookings />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </div>
    );
}

export default App;
