import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw, Play } from 'lucide-react';

const FlappyBird = () => {
    const { updateBalance } = useGame();
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('START');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('flappyHighScore')) || 0);
    const animationIdRef = useRef(null);

    // Game variables using refs to avoid re-renders in loop
    const birdRef = useRef({
        x: 50,
        y: 150,
        width: 34,
        height: 24,
        gravity: 0.25,
        velocity: 0,
        jump: -4.5
    });
    const pipesRef = useRef([]);
    const framesRef = useRef(0);

    const resetGame = () => {
        birdRef.current = { x: 50, y: 150, width: 34, height: 24, gravity: 0.25, velocity: 0, jump: -4.5 };
        pipesRef.current = [];
        framesRef.current = 0;
        setScore(0);
        setGameState('START');
    };

    const triggerGameOver = (currentScore) => {
        if (gameState === 'GAME_OVER') return;
        setGameState('GAME_OVER');
        
        if (currentScore > highScore) {
            setHighScore(currentScore);
            localStorage.setItem('flappyHighScore', currentScore);
        }
        updateBalance(currentScore * 2);
    };

    const handleInput = () => {
        if (gameState === 'START') {
            setGameState('PLAYING');
            birdRef.current.velocity = birdRef.current.jump;
        } else if (gameState === 'PLAYING') {
            birdRef.current.velocity = birdRef.current.jump;
        } else if (gameState === 'GAME_OVER') {
            resetGame();
        }
    };

    const update = () => {
        if (gameState !== 'PLAYING') return;

        const bird = birdRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y + bird.height >= canvas.height - 20) {
            bird.y = canvas.height - bird.height - 20;
            triggerGameOver(score);
        }

        // Update pipes
        if (framesRef.current % 100 === 0) {
            let gap = 120;
            let topPipeHeight = Math.random() * (canvas.height - gap - 60) + 20;
            pipesRef.current.push({
                x: canvas.width,
                top: topPipeHeight,
                bottom: canvas.height - (topPipeHeight + gap),
                passed: false
            });
        }

        for (let i = 0; i < pipesRef.current.length; i++) {
            let p = pipesRef.current[i];
            p.x -= 2;

            // Collision
            if (bird.x + bird.width > p.x && bird.x < p.x + 50 && 
                (bird.y < p.top || bird.y + bird.height > canvas.height - p.bottom)) {
                triggerGameOver(score);
            }

            if (p.x + 50 < bird.x && !p.passed) {
                setScore(s => s + 1);
                p.passed = true;
            }

            if (p.x + 50 < 0) {
                pipesRef.current.shift();
                i--;
            }
        }

        framesRef.current++;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky
        ctx.fillStyle = '#4ec0ca';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Clouds (Simplified)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(100, 100, 30, 0, Math.PI * 2);
        ctx.arc(130, 100, 40, 0, Math.PI * 2);
        ctx.arc(160, 100, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(300, 200, 25, 0, Math.PI * 2);
        ctx.arc(330, 200, 35, 0, Math.PI * 2);
        ctx.arc(360, 200, 25, 0, Math.PI * 2);
        ctx.fill();

        // Pipes
        pipesRef.current.forEach(p => {
            // Pipe Body
            ctx.fillStyle = '#73bf2e';
            ctx.strokeStyle = '#558022';
            ctx.lineWidth = 3;
            
            // Top pipe
            ctx.fillRect(p.x, 0, 50, p.top);
            ctx.strokeRect(p.x, 0, 50, p.top);
            
            // Pipe Cap (Top)
            ctx.fillRect(p.x - 5, p.top - 20, 60, 20);
            ctx.strokeRect(p.x - 5, p.top - 20, 60, 20);
            
            // Bottom pipe
            ctx.fillRect(p.x, canvas.height - p.bottom, 50, p.bottom);
            ctx.strokeRect(p.x, canvas.height - p.bottom, 50, p.bottom);
            
            // Pipe Cap (Bottom)
            ctx.fillRect(p.x - 5, canvas.height - p.bottom, 60, 20);
            ctx.strokeRect(p.x - 5, canvas.height - p.bottom, 60, 20);

            // Shading on pipe
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(p.x + 5, 0, 10, p.top);
            ctx.fillRect(p.x + 5, canvas.height - p.bottom, 10, p.bottom);
        });

        // Floor
        ctx.fillStyle = '#ded895'; // Dirt
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        ctx.fillStyle = '#73bf2e'; // Grass top
        ctx.fillRect(0, canvas.height - 25, canvas.width, 5);
        ctx.strokeStyle = '#558022';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, canvas.height - 25, canvas.width, 5);

        // Bird
        const bird = birdRef.current;
        const birdX = bird.x + bird.width/2;
        const birdY = bird.y + bird.height/2;

        ctx.save();
        ctx.translate(birdX, birdY);
        // Rotate based on velocity
        ctx.rotate(Math.min(Math.PI/4, Math.max(-Math.PI/4, bird.velocity * 0.1)));

        // Body
        ctx.fillStyle = '#f8d020';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Wing
        const wingOffset = Math.sin(framesRef.current * 0.3) * 5;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-8, wingOffset > 0 ? 0 : -2, 10, 6 + Math.abs(wingOffset), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(8, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(10, -4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#f03000';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(22, 2);
        ctx.lineTo(12, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        if (gameState === 'GAME_OVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    useEffect(() => {
        const loop = () => {
            update();
            draw();
            animationIdRef.current = requestAnimationFrame(loop);
        };
        animationIdRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationIdRef.current);
    }, [gameState, score]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleInput();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    return (
        <GameWrapper title="Flappy Bird">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '3rem', color: '#9b59b6', fontSize: '1.5rem', fontWeight: 800 }}>
                    <div>Score: {score}</div>
                    <div>Best: {highScore}</div>
                </div>

                <div style={{ position: 'relative', width: 'fit-content' }}>
                    <canvas 
                        ref={canvasRef} 
                        width="400" 
                        height="500" 
                        onClick={handleInput}
                        style={{ 
                            border: '4px solid #4a235a', 
                            borderRadius: '16px', 
                            cursor: 'pointer',
                            boxShadow: '0 0 30px rgba(108, 52, 131, 0.3)'
                        }} 
                    />
                    
                    {gameState === 'START' && (
                        <div style={{ 
                            position: 'absolute', 
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(15, 7, 26, 0.4)',
                            borderRadius: '12px'
                        }}>
                            <h2 style={{ color: '#9b59b6', fontSize: '2.5rem', marginBottom: '1rem' }}>Ready?</h2>
                            <button onClick={handleInput} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                                <Play size={20} /> Start Game
                            </button>
                        </div>
                    )}

                    {gameState === 'GAME_OVER' && (
                        <div style={{ 
                            position: 'absolute', 
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '12px'
                        }}>
                            <h2 style={{ color: '#9b59b6', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Game Over</h2>
                            <p style={{ color: '#e8d5f0', marginBottom: '1.5rem' }}>Earned: <span style={{ color: '#FFD700', fontWeight: 600 }}>+{score * 2}</span> Z Coins</p>
                            <button onClick={resetGame} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6c3483, #4a235a)' }}>
                                <RotateCcw size={20} /> Play Again
                            </button>
                        </div>
                    )}
                </div>

                <p style={{ color: '#555', fontSize: '1.1rem' }}>Click or Press Space to Jump</p>
            </div>
        </GameWrapper>
    );
};

export default FlappyBird;
