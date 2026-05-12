import React, { useState, useEffect, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const SNAKES_AND_LADDERS = {
    4: 26, 13: 46, 27: 5, 33: 49, 39: 3, 42: 63, 43: 18, 50: 69,
    54: 31, 62: 81, 66: 45, 74: 92, 89: 51, 95: 75, 99: 41
};

const SnakeLadder = () => {
    const { updateBalance } = useGame();
    const [currentPos, setCurrentPos] = useState(1);
    const [diceValue, setDiceValue] = useState(null);
    const [status, setStatus] = useState("Roll the dice to start!");
    const [isRolling, setIsRolling] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const squares = [];
    let currentNum = 100;
    for (let row = 0; row < 10; row++) {
        let rowArray = [];
        for (let col = 0; col < 10; col++) {
            rowArray.push(currentNum - col);
        }
        if (row % 2 !== 0) {
            rowArray.reverse();
        }
        squares.push(...rowArray);
        currentNum -= 10;
    }

    const rollDice = () => {
        if (isRolling || isGameOver) return;

        setIsRolling(true);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        
        let rolls = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                setDiceValue(finalRoll);
                movePlayer(finalRoll);
            }
        }, 50);
    };

    const movePlayer = (roll) => {
        const nextPos = currentPos + roll;
        if (nextPos > 100) {
            setStatus(`Rolled ${roll}. Too high to finish!`);
            setIsRolling(false);
            return;
        }

        setStatus(`Rolled ${roll}! Moved to ${nextPos}.`);
        setCurrentPos(nextPos);

        setTimeout(() => {
            let finalPos = nextPos;
            if (SNAKES_AND_LADDERS[nextPos]) {
                finalPos = SNAKES_AND_LADDERS[nextPos];
                if (finalPos > nextPos) {
                    setStatus(`Yay! Ladder to ${finalPos}! 🪜`);
                } else {
                    setStatus(`Oh no! Snake to ${finalPos}! 🐍`);
                }
                setCurrentPos(finalPos);
            }

            if (finalPos === 100) {
                setStatus("You Win! 🎉 (+30 Z Coins)");
                updateBalance(30);
                setIsGameOver(true);
            }
            
            setIsRolling(false);
        }, 600);
    };

    const resetGame = () => {
        setCurrentPos(1);
        setDiceValue(null);
        setStatus("Roll the dice to start!");
        setIsGameOver(false);
    };

    return (
        <GameWrapper title="Snake & Ladder">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)',
                    minHeight: '2.5rem',
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
                    position: 'relative',
                    width: 'min(100%, 500px)',
                    aspectRatio: '1',
                    backgroundImage: 'url("/board.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '4px solid var(--accent-primary)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gridTemplateRows: 'repeat(10, 1fr)'
                }}>
                    {squares.map((num) => (
                        <div key={num} style={{ 
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {currentPos === num && (
                                <div style={{ 
                                    width: '70%',
                                    height: '70%',
                                    background: 'radial-gradient(circle at 30% 30%, #ff4b2b, #ff416c)',
                                    borderRadius: '50%',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
                                    zIndex: 10,
                                    border: '2px solid white'
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button 
                        onClick={rollDice} 
                        disabled={isRolling || isGameOver}
                        className="btn-primary"
                        style={{ 
                            fontSize: '1.2rem',
                            padding: '1rem 2rem',
                            opacity: (isRolling || isGameOver) ? 0.6 : 1
                        }}
                    >
                        {isGameOver ? 'Game Over' : 'Roll Dice 🎲'}
                    </button>

                    <div style={{ 
                        width: '60px',
                        height: '60px',
                        background: 'rgba(155, 89, 182, 0.1)',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'var(--accent-primary)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                        {diceValue || '-'}
                    </div>

                    {isGameOver && (
                        <button onClick={resetGame} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RotateCcw size={18} /> Play Again
                        </button>
                    )}
                </div>
            </div>
        </GameWrapper>
    );
};

export default SnakeLadder;
