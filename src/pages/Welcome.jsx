import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';

const Welcome = () => {
    const { user } = useGame();
    const navigate = useNavigate();


    return (
        <Layout showHeader={false}>
            <div className="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <img src="/logo.png" alt="Zeal Arcade Logo" className="hero-logo" style={{ height: '150px', width: 'auto', objectFit: 'contain', marginBottom: '2rem' }} />
                <h1 className="logo" style={{ fontSize: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Zeal <video src="/logo-video.mp4" autoPlay loop muted playsInline style={{ height: '80px', width: 'auto', borderRadius: '12px', marginLeft: '15px', verticalAlign: 'middle' }} />
                </h1>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
                    The premium web gaming platform. Experience classic games reimagined with a modern, glassmorphism aesthetic.
                </p>
                <div className="cta-buttons" style={{ display: 'flex', gap: '1.5rem' }}>
                    {user ? (
                        <Link to="/arcade" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none' }}>Explore Arcade</Link>
                    ) : (
                        <>
                            <Link to="/signup" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none' }}>Get Started</Link>
                            <Link to="/login" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none', background: 'rgba(155, 89, 182, 0.05)', color: 'var(--text-primary)', border: '1px solid rgba(155, 89, 182, 0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>Log In</Link>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Welcome;
