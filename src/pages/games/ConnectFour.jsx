import React, { useState, useEffect } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

const ConnectFour = () => {
    const { updateBalance } = useGame();
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState('red');
    const [gameActive, setGameActive] = useState(true);
    const [status, setStatus] = useState("Red's Turn");
    const [winner, setWinner] = useState(null);

    const checkWin = (grid, r, c) => {
        const directions = [
            [[0, 1], [0, -1]], 
            [[1, 0], [-1, 0]], 
            [[1, 1], [-1, -1]], 
            [[1, -1], [-1, 1]]  
        ];
        const player = grid[r][c];
        for (let dir of directions) {
            let count = 1;
            for (let way of dir) {
                let dr = r + way[0];
                let dc = c + way[1];
                while (dr >= 0 && dr < ROWS && dc >= 0 && dc < COLS && grid[dr][dc] === player) {
                    count++;
                    dr += way[0];
                    dc += way[1];
                }
            }
            if (count >= 4) return true;
        }
        return false;
    };

    const handleColumnClick = (c) => {
        if (!gameActive || winner) return;

        let r = -1;
        for (let i = 0; i < ROWS; i++) {
            if (board[i][c] === null) {
                r = i;
                break;
            }
        }

        if (r === -1) return;

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = currentPlayer;
        setBoard(newBoard);

        if (checkWin(newBoard, r, c)) {
            setWinner(currentPlayer);
            setGameActive(false);
            setStatus(`${currentPlayer === 'red' ? 'Red' : 'Yellow'} Wins! 🎉 (+30 Z Coins)`);
            updateBalance(30); // Win reward
            return;
        }

        const isDraw = newBoard.every(row => row.every(cell => cell !== null));
        if (isDraw) {
            setGameActive(false);
            setStatus("It's a Draw! 🤝 (+10 Z Coins)");
            updateBalance(10); // Refund
            return;
        }

        const nextPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
        setCurrentPlayer(nextPlayer);
        setStatus(`${nextPlayer === 'red' ? "Red's" : "Yellow's"} Turn`);
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setCurrentPlayer('red');
        setGameActive(true);
        setStatus("Red's Turn");
        setWinner(null);
    };

    return (
        <GameWrapper title="Connect Four">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    color: currentPlayer === 'red' ? '#ef4444' : '#facc15',
                    minHeight: '2rem',
                    textAlign: 'center'
                }}>
                    {status.includes('Z Coins') ? (
                        <>
                            {status.split('(+')[0]}
                            <span style={{ color: '#FFD700' }}>(+{status.split('(+')[1]}</span>
                        </>
                    ) : status}
                </div>

                <div style={{ 
                    display: 'flex',
                    gap: '10px',
                    background: 'rgba(30, 58, 138, 0.4)',
                    padding: '15px',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)',
                    border: '2px solid rgba(59, 130, 246, 0.3)'
                }}>
                    {Array.from({ length: COLS }).map((_, c) => (
                        <div 
                            key={c} 
                            onClick={() => handleColumnClick(c)}
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column-reverse', 
                                gap: '10px',
                                cursor: gameActive ? 'pointer' : 'default',
                                padding: '5px',
                                borderRadius: '40px',
                                transition: 'background 0.2s',
                            }}
                            className="column-hover"
                        >
                            {Array.from({ length: ROWS }).map((_, r) => (
                                <div 
                                    key={r} 
                                    style={{ 
                                        width: '50px',
                                        height: '50px',
                                        background: board[r][c] === 'red' ? 
                                            'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)' : 
                                            board[r][c] === 'yellow' ? 
                                            'radial-gradient(circle at 30% 30%, #facc15, #a16207)' : 
                                            '#0f071a',
                                        borderRadius: '50%',
                                        boxShadow: board[r][c] ? 
                                            `0 5px 15px ${board[r][c] === 'red' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(250, 204, 21, 0.4)'}, inset 0 -5px 10px rgba(0,0,0,0.3)` : 
                                            'inset 0 5px 10px rgba(0,0,0,0.5)',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }} 
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {!gameActive && (
                    <button onClick={resetGame} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                        <RotateCcw size={18} /> Play Again
                    </button>
                )}
            </div>

            <style>{`
                .column-hover:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </GameWrapper>
    );
};

export default ConnectFour;
