import React, { useState, useEffect, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, Trophy } from 'lucide-react';

const Sudoku = () => {
    const { balance, updateBalance } = useGame();
    const [level, setLevel] = useState(parseInt(localStorage.getItem('sudokuLevel')) || 1);
    const [puzzle, setPuzzle] = useState([]);
    const [solution, setSolution] = useState([]);
    const [userGrid, setUserGrid] = useState([]);
    const [isWin, setIsWin] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const getCost = (lvl) => {
        if (lvl === 1) return 0;
        return Math.floor(lvl / 2) * 10;
    };

    const generatePuzzle = useCallback((lvl) => {
        let board = Array.from({ length: 9 }, () => Array(9).fill(0));
        
        // Fill diagonal blocks
        for (let i = 0; i < 9; i += 3) {
            let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            let idx = 0;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    board[i + r][i + c] = nums[idx++];
                }
            }
        }

        const isValid = (b, r, c, num) => {
            for (let i = 0; i < 9; i++) {
                if (b[r][i] === num) return false;
                if (b[i][c] === num) return false;
            }
            let startRow = Math.floor(r / 3) * 3;
            let startCol = Math.floor(c / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (b[startRow + i][startCol + j] === num) return false;
                }
            }
            return true;
        };

        const solve = (b) => {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b[r][c] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isValid(b, r, c, num)) {
                                b[r][c] = num;
                                if (solve(b)) return true;
                                b[r][c] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        solve(board);
        setSolution(board.map(row => [...row]));

        let pBoard = board.map(row => [...row]);
        let totalCluesToKeep = Math.max(25, 65 - Math.floor(((lvl - 1) / 49) * 40));
        let toRemove = 81 - totalCluesToKeep;

        while (toRemove > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (pBoard[r][c] !== 0) {
                pBoard[r][c] = 0;
                toRemove--;
            }
        }
        setPuzzle(pBoard.map(row => [...row]));
        setUserGrid(pBoard.map(row => [...row]));
        setIsWin(false);
    }, []);

    useEffect(() => {
        const cost = getCost(level);
        if (cost === 0 || localStorage.getItem(`sudoku_unlocked_${level}`)) {
            generatePuzzle(level);
            setShowPayment(false);
        } else {
            setShowPayment(true);
        }
    }, [level, generatePuzzle]);

    const handleInputChange = (r, c, val) => {
        if (puzzle[r][c] !== 0 || isWin) return;
        const newVal = val.replace(/[^1-9]/g, '');
        const newGrid = userGrid.map((row, ri) => 
            row.map((cell, ci) => (ri === r && ci === c ? (newVal ? parseInt(newVal) : 0) : cell))
        );
        setUserGrid(newGrid);

        // Check for win
        let complete = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (newGrid[i][j] !== solution[i][j]) {
                    complete = false;
                    break;
                }
            }
        }
        if (complete) {
            setIsWin(true);
            const cost = getCost(level);
            updateBalance(cost + 20); // Reward
        }
    };

    const handlePay = () => {
        const cost = getCost(level);
        if (balance >= cost) {
            updateBalance(-cost);
            localStorage.setItem(`sudoku_unlocked_${level}`, 'true');
            setShowPayment(false);
            generatePuzzle(level);
        } else {
            alert("Not enough Z Coins!");
        }
    };

    const nextLevel = () => {
        if (level < 50) {
            const nextLvl = level + 1;
            setIsWin(false);
            setLevel(nextLvl);
            localStorage.setItem('sudokuLevel', nextLvl);
        }
    };

    const prevLevel = () => {
        if (level > 1) {
            const nextLvl = level - 1;
            setIsWin(false);
            setLevel(nextLvl);
            localStorage.setItem('sudokuLevel', nextLvl);
        }
    };

    return (
        <GameWrapper title="Sudoku">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={prevLevel} disabled={level === 1} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <ChevronLeft />
                    </button>
                    <h2 style={{ margin: 0, color: '#9b59b6', fontSize: '2rem' }}>Level {level}</h2>
                    <button onClick={nextLevel} disabled={level === 50} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <ChevronRight />
                    </button>
                </div>

                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(9, 1fr)',
                    gap: '1px',
                    background: '#4a235a',
                    border: '3px solid #4a235a',
                    width: 'min(100%, 450px)',
                    aspectRatio: '1',
                    boxShadow: '0 0 30px rgba(108, 52, 131, 0.3)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {userGrid.map((row, r) => (
                        row.map((val, c) => {
                            const isFixed = puzzle[r][c] !== 0;
                            const isError = !isFixed && val !== 0 && val !== solution[r][c];
                            const isBottomBorder = (r + 1) % 3 === 0 && r < 8;
                            const isRightBorder = (c + 1) % 3 === 0 && c < 8;

                            return (
                                <div key={`${r}-${c}`} style={{
                                    background: isFixed ? 'rgba(155, 89, 182, 0.1)' : '#0f071a',
                                    borderBottom: isBottomBorder ? '2px solid #4a235a' : 'none',
                                    borderRight: isRightBorder ? '2px solid #4a235a' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <input
                                        type="text"
                                        maxLength="1"
                                        value={val === 0 ? '' : val}
                                        onChange={(e) => handleInputChange(r, c, e.target.value)}
                                        readOnly={isFixed || isWin}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'center',
                                            fontSize: '1.4rem',
                                            fontWeight: isFixed ? 800 : 400,
                                            color: isFixed ? '#9b59b6' : isError ? '#ef4444' : '#e8d5f0',
                                            outline: 'none',
                                            cursor: isFixed ? 'default' : 'pointer'
                                        }}
                                    />
                                </div>
                            );
                        })
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setUserGrid(puzzle.map(row => [...row]))} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trash2 size={18} /> Clear
                    </button>
                    <button onClick={() => generatePuzzle(level)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RotateCcw size={18} /> Reset
                    </button>
                </div>

                {showPayment && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 style={{ color: '#9b59b6' }}>Unlock Level {level}</h2>
                            <p>Entry Fee: <span style={{ color: '#FFD700', fontWeight: 800 }}>{getCost(level)} Z Coins</span></p>
                            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1.5rem' }}>Balance: <span style={{ color: '#FFD700' }}>{balance}</span> Z Coins</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button className="btn-primary" onClick={handlePay} style={{ background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>Pay & Play</button>
                                <button className="btn-secondary" onClick={prevLevel}>Go Back</button>
                            </div>
                        </div>
                    </div>
                )}

                {isWin && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <Trophy size={48} color="#9b59b6" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ color: '#9b59b6' }}>Puzzle Solved!</h2>
                            <p>You earned <span style={{ color: '#FFD700', fontWeight: 800 }}>{getCost(level) + 20} Z Coins</span>!</p>
                            <button className="btn-primary" onClick={nextLevel} style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                                Next Level ➔
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </GameWrapper>
    );
};

export default Sudoku;
