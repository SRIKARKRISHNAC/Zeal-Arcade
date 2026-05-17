import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Play, User, Users } from 'lucide-react';

const games = [
    { id: 'snake', title: 'Snake', icon: '🐍', desc: 'The classic snake game. Eat apples and grow longer.', path: '/games/snake', type: 'single' },
    { id: 'tic-tac-toe', title: 'Tic-Tac-Toe', icon: '❌⭕', desc: 'Outsmart your opponent in this classic game of Xs and Os.', path: '/games/tic-tac-toe', type: 'multi' },
    { id: 'sudoku', title: 'Sudoku', icon: '🔢', desc: 'Challenge your mind with the ultimate grid-based number puzzle.', path: '/games/sudoku', type: 'single' },
    { id: 'connect-four', title: 'Connect Four', icon: '🔴🟡', desc: 'Strategize and drop your discs to connect four in a row.', path: '/games/connect-four', type: 'multi' },
    { id: 'snake-ladder', title: 'Snake & Ladder', icon: '🪜', desc: 'Climb the ladders and dodge the snakes to reach 100.', path: '/games/snake-ladder', type: 'multi' },
    { id: 'ludo', title: 'Ludo', icon: '🎲', desc: 'Race your tokens to the center in this classic board game.', path: '/games/ludo', type: 'multi' },
    { id: 'flappy-bird', title: 'Flappy Bird', icon: '🐦', desc: 'Navigate the bird through the pipes without crashing.', path: '/games/flappy-bird', type: 'single' },
    { id: 'arrows', title: 'Arrows', icon: '↗️', desc: 'Follow the arrows to find your path to the finish.', path: '/games/arrows', type: 'single' },
    { id: 'pacman', title: 'Pac-Man', icon: '🟡', desc: 'Classic maze game. Eat pellets and avoid ghosts.', path: '/games/pacman', type: 'single' },
    { id: 'sea-battle', title: 'Sea Battle', icon: '🚢', desc: 'Command your fleet and sink your opponent\'s ships.', path: '/games/sea-battle', type: 'multi' },
    { id: 'ping-pong', title: 'Ping Pong', icon: '🏓', desc: 'Fast-paced table tennis action. Don\'t miss the ball!', path: '/games/ping-pong', type: 'multi' },
    { id: 'hand-slap', title: 'Hand Slap', icon: '✋', desc: 'Test your reflexes in this high-speed slapping game.', path: '/games/hand-slap', type: 'multi' },
    { id: 'rps', title: 'RPS', icon: '✊✌️✋', desc: 'Rock, Paper, Scissors! Choose wisely to defeat your foe.', path: '/games/rps', type: 'multi' },
    { id: 'air-hockey', title: 'Air Hockey', icon: '🏒', desc: 'Glide across the ice and score goals to win.', path: '/games/air-hockey', type: 'multi' },
    { id: 'chess', title: 'Chess', icon: '♟️', desc: 'The ultimate game of strategy. Checkmate your opponent.', path: '/games/chess', type: 'multi' },
];

const Arcade = () => {
    const [activeTab, setActiveTab] = useState('single');

    const filteredGames = games.filter(game => game.type === activeTab);

    return (
        <Layout>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', gap: '2rem' }}>
                    <div className="tab-container">
                        <button 
                            className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
                            onClick={() => setActiveTab('single')}
                        >
                            <User size={18} /> Single-Player
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'multi' ? 'active' : ''}`}
                            onClick={() => setActiveTab('multi')}
                        >
                            <Users size={18} /> Multi-Player
                        </button>
                    </div>
                    <p className="subtitle" style={{ textAlign: 'center' }}>Experience classic games reimagined with a premium touch.</p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {filteredGames.map((game, index) => (
                        <Link 
                            key={`${activeTab}-${game.id}`} 
                            to={game.path} 
                            className="game-card" 
                            style={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                animationDelay: `${index * 0.05}s`
                            }}
                        >
                            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    background: 'rgba(155, 89, 182, 0.15)', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: game.icon.length > 2 ? '1.2rem' : '2rem', 
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(155, 89, 182, 0.2)',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {game.icon}
                                </div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{game.title}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flexGrow: 1 }}>{game.desc}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                                    Play Now <Play size={16} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .tab-container {
                    display: flex;
                    background: rgba(155, 89, 182, 0.05);
                    padding: 6px;
                    border-radius: 16px;
                    border: 1px solid rgba(155, 89, 182, 0.1);
                    gap: 8px;
                }
                .tab-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 24px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                .tab-button.active {
                    background: white;
                    color: var(--accent-primary);
                    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.15);
                }
                .game-card {
                    opacity: 0;
                    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .game-card:hover {
                    transform: translateY(-8px) !important;
                }
                .game-card:hover .glass-card {
                    background: rgba(155, 89, 182, 0.2);
                    border-color: var(--accent-primary);
                    box-shadow: 0 20px 40px rgba(142, 68, 173, 0.15);
                }
            `}</style>
        </Layout>
    );
};

export default Arcade;
