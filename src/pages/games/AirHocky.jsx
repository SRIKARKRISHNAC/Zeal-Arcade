import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const AirHockey = () => {
    const { updateBalance } = useGame();
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [isSearching, setIsSearching] = useState(true);
    const animationIdRef = useRef(null);

    const puck = useRef({ x: 250, y: 400, dx: 0, dy: 0, radius: 15 });
    const player = useRef({ x: 250, y: 700, radius: 30 });
    const ai = useRef({ x: 250, y: 100, radius: 30 });

    useEffect(() => {
        const timer = setTimeout(() => setIsSearching(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const update = () => {
        if (isSearching) return;

        const p = puck.current;
        const u = player.current;
        const a = ai.current;

        // Apply physics
        p.x += p.dx;
        p.y += p.dy;
        p.dx *= 0.99;
        p.dy *= 0.99;

        // AI Movement
        const targetX = p.x;
        const aiSpeed = 4;
        if (a.x < targetX) a.x += aiSpeed;
        else a.x -= aiSpeed;
        
        // Keep AI in its half
        a.y = 100;

        // Collision with walls
        if (p.x - p.radius < 0 || p.x + p.radius > 500) {
            p.dx *= -1;
            p.x = p.x < 250 ? p.radius : 500 - p.radius;
        }

        // Collision with mallets
        const checkCollision = (mallet) => {
            const dx = p.x - mallet.x;
            const dy = p.y - mallet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.radius + mallet.radius) {
                const angle = Math.atan2(dy, dx);
                const force = 10;
                p.dx = Math.cos(angle) * force;
                p.dy = Math.sin(angle) * force;
            }
        };

        checkCollision(u);
        checkCollision(a);

        // Scoring
        if (p.y < 0) {
            if (p.x > 150 && p.x < 350) {
                setScore(s => s + 1);
                updateBalance(50);
                resetPuck();
            } else {
                p.dy *= -1;
                p.y = p.radius;
            }
        }
        if (p.y > 800) {
            if (p.x > 150 && p.x < 350) {
                setAiScore(s => s + 1);
                resetPuck();
            } else {
                p.dy *= -1;
                p.y = 800 - p.radius;
            }
        }
    };

    const resetPuck = () => {
        puck.current = { x: 250, y: 400, dx: 0, dy: 0, radius: 15 };
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 500, 800);

        // Board
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 500, 800);
        
        // Center Line
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.2)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(500, 400);
        ctx.stroke();

        // Goals
        ctx.fillStyle = '#334155';
        ctx.fillRect(150, 0, 200, 10);
        ctx.fillRect(150, 790, 200, 10);

        // Mallets
        ctx.fillStyle = 'var(--accent-primary)';
        ctx.beginPath();
        ctx.arc(player.current.x, player.current.y, player.current.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ai.current.x, ai.current.y, ai.current.radius, 0, Math.PI * 2);
        ctx.fill();

        // Puck
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(puck.current.x, puck.current.y, puck.current.radius, 0, Math.PI * 2);
        ctx.fill();

        if (isSearching) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0, 0, 500, 800);
            ctx.fillStyle = 'var(--accent-primary)';
            ctx.font = 'bold 24px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('Searching for Pro Player...', 250, 400);
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
    }, [isSearching]);

    const handleTouchMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (500 / rect.width);
        const y = (touch.clientY - rect.top) * (800 / rect.height);
        player.current.x = Math.max(player.current.radius, Math.min(500 - player.current.radius, x));
        player.current.y = Math.max(400 + player.current.radius, Math.min(800 - player.current.radius, y));
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (500 / rect.width);
        const y = (e.clientY - rect.top) * (800 / rect.height);
        player.current.x = Math.max(player.current.radius, Math.min(500 - player.current.radius, x));
        player.current.y = Math.max(400 + player.current.radius, Math.min(800 - player.current.radius, y));
    };

    return (
        <GameWrapper title="Air Hockey">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '4rem', fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                    <div>{score}</div>
                    <div>{aiScore}</div>
                </div>

                <canvas 
                    ref={canvasRef} 
                    width="500" 
                    height="800" 
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    style={{ 
                        border: '8px solid #334155', 
                        borderRadius: '20px', 
                        cursor: 'none',
                        width: 'min(90vw, 350px)',
                        height: 'auto',
                        background: '#fff',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                    }} 
                />

                <p style={{ color: 'var(--text-secondary)' }}>Drag to control your mallet</p>
            </div>
        </GameWrapper>
    );
};

export default AirHockey;
