import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Play } from 'lucide-react';

const games = [
    { id: 'snake', title: 'Snake', icon: '🐍', desc: 'The classic snake game. Eat apples and grow longer.', path: '/games/snake' },
    { id: 'tic-tac-toe', title: 'Tic-Tac-Toe', icon: '❌⭕', desc: 'Outsmart your opponent in this classic game of Xs and Os.', path: '/games/tic-tac-toe' },
    { id: 'sudoku', title: 'Sudoku', icon: '🔢', desc: 'Challenge your mind with the ultimate grid-based number puzzle.', path: '/games/sudoku' },
    { id: 'connect-four', title: 'Connect Four', icon: '🔴🟡', desc: 'Strategize and drop your discs to connect four in a row.', path: '/games/connect-four' },
    { id: 'snake-ladder', title: 'Snake & Ladder', icon: '🪜', desc: 'Climb the ladders and dodge the snakes to reach 100.', path: '/games/snake-ladder' },
    { id: 'ludo', title: 'Ludo', icon: '🎲', desc: 'Race your tokens to the center in this classic board game.', path: '/games/ludo' },
    { id: 'flappy-bird', title: 'Flappy Bird', icon: '🐦', desc: 'Navigate the bird through the pipes without crashing.', path: '/games/flappy-bird' },
    { id: 'arrows', title: 'Arrows', icon: '↗️', desc: 'Follow the arrows to find your path to the finish.', path: '/games/arrows' },
    { id: 'pacman', title: 'Pac-Man', icon: '🟡', desc: 'Classic maze game. Eat pellets and avoid ghosts.', path: '/games/pacman' },
];

const Arcade = () => {
    return (
        <Layout>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <p className="subtitle">Experience classic games reimagined with a premium touch.</p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {games.map((game, index) => (
                        <Link key={game.id} to={game.path} className="game-card" style={{ 
                            textDecoration: 'none', 
                            color: 'inherit',
                            animationDelay: `${index * 0.1}s`,
                            opacity: 1 // Overriding the animation for now
                        }}>
                            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    background: 'rgba(155, 89, 182, 0.1)', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '2rem', 
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(155, 89, 182, 0.2)'
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
                .game-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .game-card:hover {
                    transform: translateY(-8px);
                }
                .game-card:hover .glass-card {
                    border-color: var(--accent-primary);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </Layout>
    );
};

export default Arcade;
