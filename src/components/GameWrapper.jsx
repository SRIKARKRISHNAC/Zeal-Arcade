import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const GameWrapper = ({ title, children, entryFee = 10, onStart }) => {
    const { balance, updateBalance } = useGame();
    const [hasPaid, setHasPaid] = useState(false);

    const handlePay = () => {
        if (balance >= entryFee) {
            updateBalance(-entryFee);
            setHasPaid(true);
            if (onStart) onStart();
        } else {
            alert("Not enough Z Coins! Go refer a friend on the Arcade page to get 500 Z Coins!");
        }
    };

    if (!hasPaid && entryFee > 0) {
        return (
            <Layout>
                <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ position: 'static' }}>
                        <h2>Play {title}</h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Entry Fee: <span style={{ color: '#FFD700', fontWeight: 800 }}>{entryFee} Z Coins</span></p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your Balance: <span style={{ color: '#FFD700', fontWeight: 600 }}>{balance}</span> Z Coins</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={handlePay} className="btn-primary">Pay & Play</button>
                            <Link to="/arcade" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>Back</Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container">
                <h1 className="logo" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem' }}>{title}</h1>
                {children}
            </div>
        </Layout>
    );
};

export default GameWrapper;
