import React, { useState } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const { updateBalance } = useGame();
    const [winner, setWinner] = useState(null);

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i) => {
        if (winner || board[i]) return;
        const newBoard = board.slice();
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
        
        const win = calculateWinner(newBoard);
        if (win) {
            setWinner(win);
            updateBalance(30); // Reward for winning
        } else if (!newBoard.includes(null)) {
            setWinner('Draw');
            updateBalance(10); // Reward for draw
        }
    };

    const reset = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
    };

    return (
        <GameWrapper title="Tic-Tac-Toe">
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {board.map((cell, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleClick(i)}
                            className="glass-card"
                            style={{ 
                                height: '100px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '2.5rem', 
                                fontWeight: 800,
                                color: cell === 'X' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                                border: '1px solid var(--card-border)',
                                cursor: 'pointer'
                            }}
                        >
                            {cell}
                        </button>
                    ))}
                </div>

                {winner && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>
                            {winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            {winner === 'Draw' ? "You earned " : "Winner earned "}
                            <span style={{ color: '#FFD700', fontWeight: 800 }}>
                                {winner === 'Draw' ? 10 : 30} Z Coins
                            </span>
                        </p>
                        <button onClick={reset} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                            <RotateCcw size={18} /> Play Again
                        </button>
                    </div>
                )}
            </div>
        </GameWrapper>
    );
};

export default TicTacToe;
