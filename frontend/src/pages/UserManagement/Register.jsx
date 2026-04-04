import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User as UserIcon, Mail, Lock, ShieldCheck, ArrowRight, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
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
    const [stats, setStats] = useState({ users: 0, partners: 0 })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userRes = await fetch('http://localhost:5000/api/users/count')
                const laundryRes = await fetch('http://localhost:5000/api/laundry')
                const foodRes = await fetch('http://localhost:5000/api/food')
                
                let userCount = 0, partnerCount = 0
                if (userRes.ok) userCount = (await userRes.json()).count
                if (laundryRes.ok) partnerCount += (await (await fetch('http://localhost:5000/api/laundry')).json()).length
                if (foodRes.ok) partnerCount += (await (await fetch('http://localhost:5000/api/food')).json()).length
                
                setStats({ users: userCount, partners: partnerCount })
            } catch (err) { console.error(err) }
        }
        fetchStats()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent numbers in first name and last name
        if ((name === 'firstName' || name === 'lastName') && /\d/.test(value)) {
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Name validation (double check)
        if (/\d/.test(formData.firstName) || /\d/.test(formData.lastName)) {
            return setError('First and last names cannot contain numbers')
        }

        // Email validation
        if (!formData.email.includes('@')) {
            return setError('Please enter a valid email address with @')
        }

        // Password validation
        const passwordRegex = /^[A-Z].*\d.*[@#].*$/; // Starts with Capital, contains number, contains @ or #
        
        if (formData.password.length < 8) {
            return setError('Password must be at least 8 characters long')
        }

        if (!/^[A-Z]/.test(formData.password)) {
            return setError('The first letter of the password must be a Capital letter')
        }

        if (!/\d/.test(formData.password)) {
            return setError('Password must contain at least one number')
        }

        if (!/[@#]/.test(formData.password)) {
            return setError('Password must contain at least one special character (@ or #)')
        }

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
                            <span className="stat-value">{stats.users > 0 ? `${stats.users}+` : '---'}</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.partners > 0 ? `${stats.partners}+` : '---'}</span>
                            <span className="stat-label">Premium Partners</span>
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

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-container">
                                <label>First Name</label>
                                <div className="input-wrapper">
                                    <UserIcon className="input-icon" size={18} />
                                    <input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-container">
                                <label>Last Name</label>
                                <div className="input-wrapper">
                                    <UserIcon className="input-icon" size={18} />
                                    <input type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <UserIcon className="input-icon" size={18} />
                                <input type="text" name="username" placeholder="johndoe123" value={formData.username} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="input-container">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input type="email" name="email" placeholder="john@university.edu" value={formData.email} onChange={handleChange} required />
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
                                <label className={`role-option ${formData.role === 'DOCTOR' ? 'active' : ''}`}>
                                    <input type="radio" name="role" value="DOCTOR" checked={formData.role === 'DOCTOR'} onChange={handleChange} />
                                    <span>Doctor</span>
                                </label>
                                <label className={`role-option ${formData.role === 'FOOD_PROVIDER' ? 'active' : ''}`}>
                                    <input type="radio" name="role" value="FOOD_PROVIDER" checked={formData.role === 'FOOD_PROVIDER'} onChange={handleChange} />
                                    <span>Food Provider</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-container" style={{ marginBottom: '0.5rem' }}>
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        placeholder="••••••••" 
                                        value={formData.password} 
                                        onChange={handleChange} 
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
                            <div className="input-container" style={{ marginBottom: '0.5rem' }}>
                                <label>Confirm</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        name="confirmPassword" 
                                        placeholder="••••••••" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Requirements Guide */}
                        <div className="password-requirements">
                            <p className={/^[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                <CheckCircle2 size={12} /> First letter Capital
                            </p>
                            <p className={/\d/.test(formData.password) ? 'valid' : ''}>
                                <CheckCircle2 size={12} /> At least one Number
                            </p>
                            <p className={/[@#]/.test(formData.password) ? 'valid' : ''}>
                                <CheckCircle2 size={12} /> Contains @ or #
                            </p>
                            <p className={formData.password.length >= 8 ? 'valid' : ''}>
                                <CheckCircle2 size={12} /> Min. 8 characters
                            </p>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '1.5rem' }}>
                            {isLoading ? (
                                <span className="loader-span">
                                    <div className="spinner-mini"></div>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="btn-text-content">
                                    Create Account <UserPlus size={18} />
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
