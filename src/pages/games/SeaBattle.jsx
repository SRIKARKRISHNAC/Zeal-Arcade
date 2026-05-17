import React, { useState, useEffect } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const GRID_SIZE = 10;

const SeaBattle = () => {
    const { updateBalance } = useGame();
    const [userGrid, setUserGrid] = useState(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null)));
    const [aiGrid, setAiGrid] = useState(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null)));
    const [aiShips, setAiShips] = useState([]);
    const [isSearching, setIsSearching] = useState(true);
    const [turn, setTurn] = useState('user');
    const [status, setStatus] = useState("Your turn! Target the enemy grid.");
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        initGame();
        const timer = setTimeout(() => setIsSearching(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const initGame = () => {
        const ships = generateShips();
        setAiShips(ships);
        setAiGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null)));
        setUserGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null)));
        setGameOver(false);
        setTurn('user');
    };

    const generateShips = () => {
        const ships = [];
        const lengths = [5, 4, 3, 3, 2];
        const grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));

        lengths.forEach(len => {
            let placed = false;
            while (!placed) {
                const horizontal = Math.random() > 0.5;
                const r = Math.floor(Math.random() * (horizontal ? GRID_SIZE : GRID_SIZE - len));
                const c = Math.floor(Math.random() * (horizontal ? GRID_SIZE - len : GRID_SIZE));

                let conflict = false;
                for (let i = 0; i < len; i++) {
                    if (grid[horizontal ? r : r + i][horizontal ? c + i : c]) conflict = true;
                }

                if (!conflict) {
                    const positions = [];
                    for (let i = 0; i < len; i++) {
                        const rr = horizontal ? r : r + i;
                        const cc = horizontal ? c + i : c;
                        grid[rr][cc] = true;
                        positions.push({ r: rr, c: cc });
                    }
                    ships.push({ positions, hits: 0 });
                    placed = true;
                }
            }
        });
        return ships;
    };

    const handleAttack = (r, c) => {
        if (turn !== 'user' || gameOver || isSearching || aiGrid[r][c] !== null) return;

        const newGrid = aiGrid.map(row => [...row]);
        const hit = aiShips.some(ship => ship.positions.some(pos => pos.r === r && pos.c === c));
        
        newGrid[r][c] = hit ? 'hit' : 'miss';
        setAiGrid(newGrid);

        if (hit) {
            setStatus("Direct hit! Fire again.");
            checkWin(newGrid, 'user');
        } else {
            setStatus("Miss! Enemy is returning fire...");
            setTurn('ai');
            setTimeout(aiMove, 1000);
        }
    };

    const aiMove = () => {
        let r, c;
        do {
            r = Math.floor(Math.random() * GRID_SIZE);
            c = Math.floor(Math.random() * GRID_SIZE);
        } while (userGrid[r][c] !== null);

        const newGrid = userGrid.map(row => [...row]);
        const hit = Math.random() > 0.8; // Simulated ship placement for user
        newGrid[r][c] = hit ? 'hit' : 'miss';
        setUserGrid(newGrid);

        if (hit) {
            setStatus("Enemy hit your ship!");
            checkWin(newGrid, 'ai');
            setTimeout(aiMove, 1000);
        } else {
            setStatus("Enemy missed! Your turn.");
            setTurn('user');
        }
    };

    const checkWin = (grid, player) => {
        let hits = 0;
        grid.forEach(row => row.forEach(cell => { if (cell === 'hit') hits++; }));
        if (hits >= 17) {
            setGameOver(true);
            setStatus(player === 'user' ? "Victory! You sank the entire fleet!" : "Defeat! Your fleet is destroyed.");
            if (player === 'user') updateBalance(100);
        }
    };

    return (
        <GameWrapper title="Sea Battle">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                    fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)',
                    padding: '0.5rem 2rem', background: 'rgba(155, 89, 182, 0.05)', borderRadius: '30px'
                }}>
                    {isSearching ? "Establishing Satellite Connection..." : status}
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div>
                        <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700 }}>ENEMY FLEET</p>
                        <div style={{ 
                            display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            gap: '2px', background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '4px'
                        }}>
                            {aiGrid.map((row, r) => row.map((cell, c) => (
                                <div 
                                    key={`ai-${r}-${c}`}
                                    onClick={() => handleAttack(r, c)}
                                    style={{
                                        width: 'min(8vw, 35px)', height: 'min(8vw, 35px)',
                                        background: cell === 'hit' ? '#ef4444' : (cell === 'miss' ? '#3b82f6' : '#1e3a8a'),
                                        cursor: turn === 'user' ? 'crosshair' : 'default',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {cell === 'hit' && '💥'}
                                    {cell === 'miss' && '💧'}
                                </div>
                            )))}
                        </div>
                    </div>

                    <div>
                        <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700 }}>YOUR FLEET</p>
                        <div style={{ 
                            display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            gap: '2px', background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '4px'
                        }}>
                            {userGrid.map((row, r) => row.map((cell, c) => (
                                <div 
                                    key={`user-${r}-${c}`}
                                    style={{
                                        width: 'min(8vw, 35px)', height: 'min(8vw, 35px)',
                                        background: cell === 'hit' ? '#ef4444' : (cell === 'miss' ? '#3b82f6' : '#1e3a8a'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {cell === 'hit' && '💥'}
                                    {cell === 'miss' && '💧'}
                                </div>
                            )))}
                        </div>
                    </div>
                </div>

                {gameOver && (
                    <button onClick={initGame} className="btn-primary" style={{ padding: '1rem 3rem' }}>
                        Restart Mission
                    </button>
                )}
            </div>
        </GameWrapper>
    );
};

export default SeaBattle;
