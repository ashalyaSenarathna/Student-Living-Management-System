import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                const userPayload = data.data || data
                localStorage.setItem('userInfo', JSON.stringify(userPayload))

                // Role-based redirection
                if (userPayload.role === 'HOSTEL_OWNER') {
                    navigate('/hostel-owner')
                } else if (userPayload.role === 'ADMIN') {
                    navigate('/health/pharmacy-admin') // Default to pharmacy admin for admins
                } else if (userPayload.role === 'DOCTOR') {
                    navigate('/health/doctor-portal') // Doctors go to doctor portal
                } else if (userPayload.role === 'PROVIDER') {
                    navigate('/add-laundry') // Or appropriate provider dashboard
                } else {
                    navigate('/health/medical-panel') // Students default to medical panel
                }

                window.location.reload() // Ensure navbar updates
            } else {
                setError(data.message || 'Invalid credentials. Please try again.')
            }
        } catch (err) {
            setError('Connection lost. Please check your internet.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            {/* Background Blobs */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="left-section">
                <div className="left-content">
                    <div className="brand-icon">🏠</div>
                    <h1>Welcome <br /><span className="text-gradient">Back</span></h1>
                    <p>The easiest way to manage your student life. Log in to access your services, laundry status, and community.</p>

                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-value">2k+</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">50+</span>
                            <span className="stat-label">Partners</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-section">
                <div className="form-card">
                    <div className="form-header">
                        <h2>Sign In</h2>
                        <p>New here? <Link to="/register">Create an account</Link></p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-container">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-pass">Forgot password?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider">
                        <span>Or continue with</span>
                    </div>

                    <div className="social-login">
                        <button className="social-btn">
                            <img src="https://www.google.com/favicon.ico" width="20" alt="G" /> Google
                        </button>
                        <button className="social-btn">
                            <img src="https://www.microsoft.com/favicon.ico" width="20" alt="M" /> Microsoft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
