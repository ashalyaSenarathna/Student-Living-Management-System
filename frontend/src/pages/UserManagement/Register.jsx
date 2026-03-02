import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER'
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match')
        }

        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }),
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data))
                navigate('/')
                window.location.reload()
            } else {
                setError(data.message || 'Registration failed. Try again.')
            }
        } catch (err) {
            setError('Something went wrong. Check your connection.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="left-section">
                <div className="left-content">
                    <div className="brand-icon">🏠</div>
                    <h1>Join the <br /><span className="text-gradient">Community</span></h1>
                    <p>Start your journey with us today. Get access to the best housing management tools designed for students.</p>

                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-value">Free</span>
                            <span className="stat-label">Registration</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">24/7</span>
                            <span className="stat-label">System Access</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-section">
                <div className="form-card" style={{ padding: '2.5rem' }}>
                    <div className="form-header">
                        <h2>Create Account</h2>
                        <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-container">
                                <label>First Name</label>
                                <div className="input-wrapper">
                                    <input type="text" name="firstName" placeholder="John" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-container">
                                <label>Last Name</label>
                                <div className="input-wrapper">
                                    <input type="text" name="lastName" placeholder="Doe" onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <input type="text" name="username" placeholder="johndoe123" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <input type="email" name="email" placeholder="john@university.edu" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Account Type</label>
                            <div className="role-selector">
                                <label className={`role-option ${formData.role === 'USER' ? 'active' : ''}`}>
                                    <input type="radio" name="role" value="USER" checked={formData.role === 'USER'} onChange={handleChange} />
                                    <span>Student</span>
                                </label>
                                <label className={`role-option ${formData.role === 'PROVIDER' ? 'active' : ''}`}>
                                    <input type="radio" name="role" value="PROVIDER" checked={formData.role === 'PROVIDER'} onChange={handleChange} />
                                    <span>Laundry Provider</span>
                                </label>
                                <label className={`role-option ${formData.role === 'HOSTEL_OWNER' ? 'active' : ''}`}>
                                    <input type="radio" name="role" value="HOSTEL_OWNER" checked={formData.role === 'HOSTEL_OWNER'} onChange={handleChange} />
                                    <span>Hostel Owner</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-container">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-container">
                                <label>Confirm</label>
                                <div className="input-wrapper">
                                    <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '1rem' }}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
