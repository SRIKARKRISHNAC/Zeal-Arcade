import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { Gift, Sparkles, ShoppingBag, CreditCard, Ticket } from 'lucide-react';

const Rewards = () => {
    const { user, balance, updateBalance } = useGame();
    const [activeTab, setActiveTab] = useState('lucky');
    const [scratchState, setScratchState] = useState('unscratched'); // unscratched, scratching, scratched
    const [scratchReward, setScratchReward] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [luckyResult, setLuckyResult] = useState(null);

    const handleLuckyDraw = () => {
        if (balance < 50) {
            alert("Not enough Z Coins! Need 50 to spin.");
            return;
        }
        setIsSpinning(true);
        updateBalance(-50);
        
        setTimeout(() => {
            const outcomes = [0, 10, 50, 100, 200, 500];
            const result = outcomes[Math.floor(Math.random() * outcomes.length)];
            setLuckyResult(result);
            updateBalance(result);
            setIsSpinning(false);
        }, 2000);
    };

    const handleScratch = () => {
        if (balance < 30) {
            alert("Not enough Z Coins! Need 30 for a scratch card.");
            return;
        }
        updateBalance(-30);
        setScratchState('scratching');
        
        setTimeout(() => {
            const reward = Math.floor(Math.random() * 100);
            setScratchReward(reward);
            updateBalance(reward);
            setScratchState('scratched');
        }, 1000);
    };

    const handleBuyItem = (name, price) => {
        if (balance < price) {
            alert(`Not enough Z Coins! You need ${price} for this item.`);
            return;
        }
        updateBalance(-price);
        alert(`Successfully purchased ${name}! It will be added to your profile.`);
    };

    const handleBuyCoins = (amount, price) => {
        alert(`Redirecting to payment gateway for $${price}...`);
        // Simulate successful payment
        setTimeout(() => {
            updateBalance(amount);
            alert(`Payment successful! ${amount} Z Coins added to your account.`);
        }, 2000);
    };

    const premiumItems = [
        { name: "Golden Avatar Border", price: 1000, icon: "👑" },
        { name: "Neon Username Effect", price: 2000, icon: "✨" },
        { name: "Exclusive Founder Badge", price: 3000, icon: "💎" },
    ];

    const coinPacks = [
        { amount: 500, price: 5, icon: "💰" },
        { amount: 1500, price: 12, icon: "🎒" },
        { amount: 5000, price: 35, icon: "🏦" },
    ];

    return (
        <Layout>
            <div className="container">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('lucky')} className={activeTab === 'lucky' ? 'tab-btn active' : 'tab-btn'}>
                        <Sparkles size={18} /> Lucky Draw
                    </button>
                    <button onClick={() => setActiveTab('scratch')} className={activeTab === 'scratch' ? 'tab-btn active' : 'tab-btn'}>
                        <Ticket size={18} /> Scratch Cards
                    </button>
                    <button onClick={() => setActiveTab('store')} className={activeTab === 'store' ? 'tab-btn active' : 'tab-btn'}>
                        <ShoppingBag size={18} /> Premium Store
                    </button>
                    <button onClick={() => setActiveTab('buy')} className={activeTab === 'buy' ? 'tab-btn active' : 'tab-btn'}>
                        <CreditCard size={18} /> Buy Coins
                    </button>
                    <button 
                        onClick={() => {
                            const lastClaim = localStorage.getItem(`lastDaily_${user}`);
                            if (!lastClaim || (Date.now() - parseInt(lastClaim)) > 24 * 60 * 60 * 1000) {
                                updateBalance(100);
                                localStorage.setItem(`lastDaily_${user}`, Date.now().toString());
                                alert("Daily bonus of 100 Z Coins claimed! 🎁");
                            } else {
                                const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - parseInt(lastClaim))) / (1000 * 60 * 60));
                                alert(`Daily bonus already claimed! Come back in ${hoursLeft} hours.`);
                            }
                        }} 
                        className="tab-btn" 
                        style={{ background: 'linear-gradient(135deg, #FFD700, #DAA520)', color: '#000' }}
                    >
                        <Gift size={18} /> Daily Bonus
                    </button>
                </div>

                <div className="glass-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}>
                    
                    {activeTab === 'lucky' && (
                        <div>
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: isSpinning ? 'spin 0.5s linear infinite' : 'none' }}>🎡</div>
                            <h2>Lucky Draw</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Spend 50 Z Coins for a chance to win up to 500!</p>
                            
                            {luckyResult !== null && !isSpinning && (
                                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '12px', color: '#FFD700', fontWeight: 800 }}>
                                    {luckyResult > 0 ? `YOU WON ${luckyResult} Z COINS! 🎉` : "Better luck next time! 😅"}
                                </div>
                            )}

                            <button onClick={handleLuckyDraw} disabled={isSpinning} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
                                {isSpinning ? 'Spinning...' : 'Spin Now (50 Coins)'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'scratch' && (
                        <div>
                            <h2>Scratch & Win</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Cost: 30 Z Coins per card</p>
                            
                            <div style={{ 
                                width: '250px', 
                                height: '150px', 
                                background: scratchState === 'unscratched' ? '#444' : (scratchState === 'scratching' ? '#666' : 'linear-gradient(135deg, #FFD700, #DAA520)'),
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                color: scratchState === 'scratched' ? '#000' : '#fff',
                                fontWeight: 800,
                                margin: '0 auto 2rem',
                                cursor: scratchState === 'unscratched' ? 'pointer' : 'default',
                                position: 'relative',
                                overflow: 'hidden'
                            }} onClick={scratchState === 'unscratched' ? handleScratch : undefined}>
                                {scratchState === 'unscratched' && "CLICK TO SCRATCH"}
                                {scratchState === 'scratching' && "SCRATCHING..."}
                                {scratchState === 'scratched' && (
                                    <div style={{ animation: 'bounce 0.5s infinite alternate' }}>
                                        {scratchReward} Coins!
                                    </div>
                                )}
                            </div>

                            {scratchState === 'scratched' && (
                                <button onClick={() => setScratchState('unscratched')} className="btn-secondary">Buy Another</button>
                            )}
                        </div>
                    )}

                    {activeTab === 'store' && (
                        <div style={{ width: '100%' }}>
                            <h2 style={{ marginBottom: '2rem' }}>Premium Store</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                {premiumItems.map(item => (
                                    <div key={item.name} className="glass-card" style={{ background: 'rgba(155, 89, 182, 0.05)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.name}</h3>
                                        <div style={{ color: '#FFD700', fontWeight: 800, marginBottom: '1.5rem' }}>{item.price} Z Coins</div>
                                        <button onClick={() => handleBuyItem(item.name, item.price)} className="btn-primary" style={{ width: '100%' }}>Purchase</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'buy' && (
                        <div style={{ width: '100%' }}>
                            <h2 style={{ marginBottom: '2rem' }}>Recharge Z Coins</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Short on coins? Top up using actual money.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                {coinPacks.map(pack => (
                                    <div key={pack.amount} className="glass-card" style={{ background: 'rgba(155, 89, 182, 0.05)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{pack.icon}</div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{pack.amount} Coins</h3>
                                        <div style={{ color: '#10b981', fontWeight: 800, marginBottom: '1.5rem' }}>${pack.price}</div>
                                        <button onClick={() => handleBuyCoins(pack.amount, pack.price)} className="btn-secondary" style={{ width: '100%', borderColor: '#10b981', color: '#10b981' }}>Buy Now</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                .tab-btn {
                    background: rgba(155, 89, 182, 0.05);
                    border: 1px solid rgba(155, 89, 182, 0.1);
                    color: var(--text-secondary);
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    alignItems: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .tab-btn:hover {
                    background: rgba(155, 89, 182, 0.1);
                }
                .tab-btn.active {
                    background: var(--accent-primary);
                    color: white;
                    border-color: var(--accent-primary);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
            `}</style>
        </Layout>
    );
};

export default Rewards;
