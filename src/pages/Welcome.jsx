import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';

const Welcome = () => {
    const { user } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/arcade');
        }
    }, [user, navigate]);

    return (
        <Layout showHeader={false}>
            <div className="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <img src="/logo.png" alt="Zeal Arcade Logo" className="hero-logo" style={{ width: '150px', height: '150px', objectFit: 'contain', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)', marginBottom: '2rem' }} />
                <h1 className="logo" style={{ fontSize: '5rem' }}>Zeal <span style={{ color: '#14B481' }}>Arcade</span></h1>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
                    The premium web gaming platform. Experience classic games reimagined with a modern, glassmorphism aesthetic.
                </p>
                <div className="cta-buttons" style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/signup" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none' }}>Get Started</Link>
                    <Link to="/login" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>Log In</Link>
                </div>
            </div>
        </Layout>
    );
};

export default Welcome;
