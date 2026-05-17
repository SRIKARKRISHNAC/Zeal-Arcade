import React, { useState, useEffect, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const HandSlap = () => {
    const { updateBalance } = useGame();
    const [gameState, setGameState] = useState('IDLE'); // IDLE, ATTACKING, DEFENDING, GAME_OVER
    const [score, setScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [isSearching, setIsSearching] = useState(true);
    const [handPos, setHandPos] = useState({ user: 'base', ai: 'base' });
    const [status, setStatus] = useState("Wait for the right moment...");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSearching(false);
            setGameState('ATTACKING');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleAction = useCallback(() => {
        if (gameState === 'ATTACKING') {
            setHandPos(prev => ({ ...prev, user: 'slap' }));
            setTimeout(() => {
                const aiDodged = Math.random() > 0.4;
                if (aiDodged) {
                    setHandPos(prev => ({ ...prev, ai: 'dodge' }));
                    setStatus("Opponent dodged! You are now defending.");
                    setGameState('DEFENDING');
                } else {
                    setScore(s => s + 1);
                    setStatus("You slapped! Keep attacking.");
                }
                
                setTimeout(() => {
                    setHandPos({ user: 'base', ai: 'base' });
                }, 300);
            }, 100);
        } else if (gameState === 'DEFENDING') {
            setHandPos(prev => ({ ...prev, user: 'dodge' }));
            setTimeout(() => {
                setHandPos(prev => ({ ...prev, user: 'base' }));
            }, 300);
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'DEFENDING') {
            const timer = setTimeout(() => {
                setHandPos(prev => ({ ...prev, ai: 'slap' }));
                const userDodged = handPos.user === 'dodge';
                
                if (userDodged) {
                    setStatus("Great dodge! You are now attacking.");
                    setGameState('ATTACKING');
                } else {
                    setAiScore(s => s + 1);
                    setStatus("Ouch! Opponent slapped you.");
                    if (aiScore + 1 >= 5) {
                        setGameState('GAME_OVER');
                        updateBalance(score * 10);
                    }
                }

                setTimeout(() => {
                    setHandPos({ user: 'base', ai: 'base' });
                }, 300);
            }, Math.random() * 2000 + 1000);
            return () => clearTimeout(timer);
        }
    }, [gameState, handPos.user, score, aiScore]);

    return (
        <GameWrapper title="Hand Slap">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '4rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    <div>You: {score}</div>
                    <div>Opponent: {aiScore}</div>
                </div>

                <div style={{ 
                    position: 'relative', width: '300px', height: '400px', 
                    background: 'rgba(155, 89, 182, 0.05)', borderRadius: '24px',
                    border: '2px solid rgba(155, 89, 182, 0.1)', overflow: 'hidden'
                }}>
                    {/* Opponent Hand */}
                    <div style={{ 
                        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                        fontSize: '6rem', transition: 'all 0.1s ease',
                        top: handPos.ai === 'slap' ? '120px' : (handPos.ai === 'dodge' ? '-50px' : '20px'),
                        opacity: handPos.ai === 'dodge' ? 0.5 : 1
                    }}>
                        🖐️
                    </div>

                    {/* User Hand */}
                    <div style={{ 
                        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%) scaleY(-1)',
                        fontSize: '6rem', transition: 'all 0.1s ease',
                        bottom: handPos.user === 'slap' ? '120px' : (handPos.user === 'dodge' ? '-50px' : '20px'),
                        opacity: handPos.user === 'dodge' ? 0.5 : 1
                    }}>
                        🖐️
                    </div>

                    {isSearching && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 600, zIndex: 10, textAlign: 'center', padding: '2rem'
                        }}>
                            Finding a player with fast hands...
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{status}</p>
                    <button 
                        onMouseDown={handleAction}
                        className="btn-primary" 
                        style={{ 
                            padding: '1.5rem 4rem', fontSize: '1.5rem',
                            background: gameState === 'ATTACKING' ? 'linear-gradient(135deg, #ff4b2b, #ff416c)' : 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
                            transform: 'none'
                        }}
                    >
                        {gameState === 'ATTACKING' ? 'SLAP!' : 'DODGE!'}
                    </button>
                </div>

                {gameState === 'GAME_OVER' && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Game Over</h2>
                            <p>You scored {score} slaps!</p>
                            <p style={{ color: '#FFD700', fontWeight: 800 }}>+{score * 10} Z Coins</p>
                            <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '1.5rem' }}>Play Again</button>
                        </div>
                    </div>
                )}
            </div>
        </GameWrapper>
    );
};

export default HandSlap;
