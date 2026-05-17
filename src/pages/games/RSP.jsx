import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const PingPong = () => {
    const { updateBalance } = useGame();
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [gameState, setGameState] = useState('SEARCHING');
    const animationIdRef = useRef(null);

    const ball = useRef({ x: 300, y: 200, dx: 4, dy: 4, radius: 8 });
    const paddleWidth = 10, paddleHeight = 80;
    const player = useRef({ x: 0, y: 160 });
    const ai = useRef({ x: 590, y: 160 });

    useEffect(() => {
        const timer = setTimeout(() => setGameState('PLAYING'), 2000);
        return () => clearTimeout(timer);
    }, []);

    const update = () => {
        if (gameState !== 'PLAYING') return;

        const b = ball.current;
        const p = player.current;
        const a = ai.current;

        b.x += b.dx;
        b.y += b.dy;

        // AI Logic
        const aiSpeed = 3.5;
        if (a.y + paddleHeight/2 < b.y) a.y += aiSpeed;
        else a.y -= aiSpeed;

        // Wall collisions
        if (b.y + b.radius > 400 || b.y - b.radius < 0) b.dy *= -1;

        // Paddle collisions
        if (b.x - b.radius < p.x + paddleWidth && b.y > p.y && b.y < p.y + paddleHeight) {
            b.dx = Math.abs(b.dx) + 0.2;
            b.dy += (b.y - (p.y + paddleHeight/2)) * 0.1;
        }
        if (b.x + b.radius > a.x && b.y > a.y && b.y < a.y + paddleHeight) {
            b.dx = -Math.abs(b.dx) - 0.2;
            b.dy += (b.y - (a.y + paddleHeight/2)) * 0.1;
        }

        // Scoring
        if (b.x < 0) {
            setAiScore(s => s + 1);
            resetBall();
        }
        if (b.x > 600) {
            setScore(s => s + 1);
            updateBalance(10);
            resetBall();
        }
    };

    const resetBall = () => {
        ball.current = { x: 300, y: 200, dx: Math.random() > 0.5 ? 4 : -4, dy: (Math.random() - 0.5) * 6, radius: 8 };
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Board
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 600, 400);
        
        // Center Line
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(300, 0);
        ctx.lineTo(300, 400);
        ctx.stroke();

        // Paddles
        ctx.fillStyle = 'var(--accent-primary)';
        ctx.fillRect(player.current.x, player.current.y, paddleWidth, paddleHeight);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ai.current.x, ai.current.y, paddleWidth, paddleHeight);

        // Ball
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
        ctx.fill();

        if (gameState === 'SEARCHING') {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, 600, 400);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('Finding Opponent...', 300, 200);
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
    }, [gameState]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const y = (e.clientY - rect.top) * (400 / rect.height);
        player.current.y = Math.max(0, Math.min(320, y - paddleHeight/2));
    };

    return (
        <GameWrapper title="Ping Pong">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '5rem', fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                    <div>{score}</div>
                    <div>{aiScore}</div>
                </div>

                <canvas 
                    ref={canvasRef} 
                    width="600" 
                    height="400" 
                    onMouseMove={handleMouseMove}
                    style={{ 
                        border: '4px solid #4a235a', 
                        borderRadius: '12px', 
                        cursor: 'none',
                        width: 'min(90vw, 600px)',
                        height: 'auto'
                    }} 
                />

                <p style={{ color: 'var(--text-secondary)' }}>Move mouse to control your paddle</p>
            </div>
        </GameWrapper>
    );
};

export default PingPong;
