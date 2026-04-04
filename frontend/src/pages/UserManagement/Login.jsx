import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import './Login.css'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [userCount, setUserCount] = useState(0)
    const [partnersCount, setPartnersCount] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Count
                const userRes = await fetch('http://localhost:5000/api/users/count')
                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUserCount(userData.count)
                }

                // Fetch Partners Count (Laundry + Food)
                const laundryRes = await fetch('http://localhost:5000/api/laundry')
                const foodRes = await fetch('http://localhost:5000/api/food')
                
                let totalPartners = 0
                if (laundryRes.ok) {
                    const laundryData = await laundryRes.json()
                    totalPartners += laundryData.length
                }
                if (foodRes.ok) {
                    const foodData = await foodRes.json()
                    totalPartners += foodData.length
                }
                setPartnersCount(totalPartners || 0)
            } catch (err) {
                console.error('Error fetching stats:', err)
            }
        }
        fetchData()
    }, [])

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
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data))

                // Role-based redirection
                if (data.role === 'HOSTEL_OWNER') {
                    navigate('/hostel-owner')
                } else if (data.role === 'ADMIN') {
                    navigate('/admin')
                } else if (data.role === 'PROVIDER') {
                    navigate('/add-laundry') // Or appropriate provider dashboard
                } else {
                    navigate('/')
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
                            <span className="stat-value">{userCount > 0 ? `${userCount}+` : '---'}</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{partnersCount > 0 ? `${partnersCount}+` : '---'}</span>
                            <span className="stat-label">Premium Partners</span>
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

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-container">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-pass">Forgot password?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <span className="loader-span">
                                    <div className="spinner-mini"></div>
                                    Signing In...
                                </span>
                            ) : (
                                <span className="btn-text-content">
                                    Sign In <ArrowRight size={18} />
                                </span>
                            )}
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
