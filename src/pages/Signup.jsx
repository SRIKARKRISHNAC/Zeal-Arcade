import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';

const Signup = () => {
    const [username, setUsername] = useState('');
    const { login, updateBalance } = useGame();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            localStorage.removeItem('snake_highscore');
            localStorage.removeItem('arrowsLevel');
            login(username);
            updateBalance(1000); // New user bonus
            navigate('/arcade');
        }
    };

    return (
        <Layout showHeader={false}>
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '80px', marginBottom: '1.5rem', borderRadius: '16px' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join the premium arcade experience</p>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Choose Username</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--card-border)',
                                    background: 'rgba(155, 89, 182, 0.1)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>Get Started</button>
                    </form>
                    
                    <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Signup;
