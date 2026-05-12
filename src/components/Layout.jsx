import React from 'react';
import { useGame } from '../context/GameContext';
import { LogOut, Coins, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children, showHeader = true }) => {
    const { user, balance, logout, updateBalance } = useGame();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleRefer = () => {
        const link = `https://zealarcade.com/signup?ref=${user}`;
        alert(`Referral link generated!\n\n${link}\n\nShare this with a friend! We've added 500 Z Coins to your account as an instant bonus!`);
        updateBalance(500);
    };

    return (
        <div className="min-h-screen relative">
            <div className="glow-circle circle-1"></div>
            <div className="glow-circle circle-2"></div>
            <div className="glow-circle circle-3"></div>

            {showHeader && user && (
                <div className="container" style={{ paddingBottom: 0 }}>
                    <header className="header" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <Link to="/arcade" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '12px' }} />
                                <h1 className="logo" style={{ fontSize: '1.5rem', margin: 0 }}>Zeal <span style={{ color: '#14B481' }}>Arcade</span></h1>
                            </Link>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Welcome, {user}!</div>
                                <button onClick={handleRefer} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                    <Gift size={18} /> Refer
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 215, 0, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                                    <Coins size={18} color="#FFD700" />
                                    <span style={{ fontWeight: 800, color: '#FFD700' }}>{balance.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Z Coins</span>
                                </div>
                                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    </header>
                </div>
            )}

            <main>{children}</main>
        </div>
    );
};

export default Layout;
