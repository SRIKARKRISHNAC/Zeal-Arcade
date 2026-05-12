import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';
import { useGame } from '../../context/GameContext';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 150;

const Snake = () => {
    const { updateBalance } = useGame();
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snake_highscore')) || 0);

    const setGameOver = (status, finalScore) => {
        setIsGameOver(status);
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('snake_highscore', finalScore);
        }
        updateBalance(finalScore * 2);
    };

    const gameLoopRef = useRef();

    const generateFood = useCallback(() => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            // Check if food is on snake
            const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!onSnake) break;
        }
        setFood(newFood);
    }, [snake]);

    const moveSnake = useCallback(() => {
        if (isGameOver || isPaused || !hasStarted) return;

        setSnake(prevSnake => {
            const head = { ...prevSnake[0] };
            head.x += direction.x;
            head.y += direction.y;

            // Check collisions
            if (
                head.x < 0 || head.x >= GRID_SIZE ||
                head.y < 0 || head.y >= GRID_SIZE ||
                prevSnake.some(segment => segment.x === head.x && segment.y === head.y)
            ) {
                setGameOver(true, score);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Check if food eaten
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                generateFood();
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, isGameOver, isPaused, score, highScore, generateFood, updateBalance]);

    useEffect(() => {
        gameLoopRef.current = setInterval(moveSnake, SPEED);
        return () => clearInterval(gameLoopRef.current);
    }, [moveSnake]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!hasStarted && (e.key.startsWith('Arrow') || e.key === ' ')) {
                setHasStarted(true);
                return;
            }
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
                case ' ': setIsPaused(p => !p); break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction, hasStarted]);

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setIsGameOver(false);
        setScore(0);
        setIsPaused(false);
        setHasStarted(true);
        generateFood();
    };

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="logo" style={{ fontSize: '2.5rem', color: '#9b59b6' }}>Snake <span className="accent" style={{ background: 'none', WebkitTextFillColor: '#9b59b6' }}>Game</span></h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
                        <div className="glass-card" style={{ padding: '0.5rem 1.5rem', borderColor: '#4a235a' }}>
                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#aaa' }}>{score}</div>
                        </div>
                        <div className="glass-card" style={{ padding: '0.5rem 1.5rem', borderColor: '#4a235a' }}>
                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>High Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#aaa' }}>{highScore}</div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
                        background: 'rgba(155, 89, 182, 0.05)',
                        border: '4px solid #4a235a',
                        boxShadow: '0 0 20px #6c3483',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backdropFilter: 'blur(5px)'
                    }}>
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                            const x = i % GRID_SIZE;
                            const y = Math.floor(i / GRID_SIZE);
                            const isSnakeHead = snake[0].x === x && snake[0].y === y;
                            const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
                            const isFood = food.x === x && food.y === y;

                            return (
                                <div key={i} style={{
                                    width: '20px',
                                    height: '20px',
                                    background: isSnakeHead ? '#6c3483' :
                                        isSnakeBody ? '#4a235a' : 'transparent',
                                    border: isSnakeHead || isSnakeBody ? '1px solid #1a0a2e' : '1px solid rgba(155, 89, 182, 0.1)',
                                    borderRadius: isSnakeHead ? '6px' : isSnakeBody ? '2px' : '0',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {isSnakeHead && (
                                        <>
                                            <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#e8d5f0', borderRadius: '50%', top: '4px', left: '4px' }} />
                                            <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#e8d5f0', borderRadius: '50%', top: '4px', right: '4px' }} />
                                        </>
                                    )}
                                    {isFood && (
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            background: '#27ae60',
                                            borderRadius: '50%',
                                            position: 'relative',
                                            boxShadow: '0 0 10px rgba(39, 174, 96, 0.4), 0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            {/* Apple Stem */}
                                            <div style={{ position: 'absolute', width: '2px', height: '6px', background: '#1e8449', top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(10deg)' }} />
                                            {/* Apple Shine */}
                                            <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#58d68d', top: '3px', left: '3px', borderRadius: '50%' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {(!hasStarted || isGameOver || isPaused) && (
                        <div className="modal-overlay" style={{
                            position: 'absolute',
                            borderRadius: '12px',
                            background: !hasStarted ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.4)',
                            backdropFilter: !hasStarted ? 'none' : 'blur(8px)'
                        }}>
                            <div className="modal-content" style={{ padding: '2rem' }}>
                                {!hasStarted ? (
                                    <>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#9b59b6' }}>Ready?</h2>
                                        <p style={{ marginBottom: '1.5rem', color: '#555' }}>Press any Arrow Key or the button to start!</p>
                                        <button onClick={() => setHasStarted(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                                            <Play size={18} /> Start Game
                                        </button>
                                    </>
                                ) : isGameOver ? (
                                    <>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#9b59b6' }}>Game Over!</h2>
                                        <p style={{ marginBottom: '1.5rem', color: '#555' }}>You earned <span style={{ color: '#FFD700', fontWeight: 800 }}>{score * 2} Z Coins</span></p>
                                        <button onClick={resetGame} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                                            <RotateCcw size={18} /> Play Again
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#9b59b6' }}>Paused</h2>
                                        <p style={{ marginBottom: '1.5rem', color: '#555' }}>Press Space or the button to resume</p>
                                        <button onClick={() => setIsPaused(false)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                                            <Play size={18} /> Resume
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', color: '#555' }}>
                    <p>Use Arrow Keys to move • Space to Pause</p>
                </div>
            </div>
        </Layout>
    );
};

export default Snake;
