import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw, Play } from 'lucide-react';

const Pacman = () => {
    const { updateBalance } = useGame();
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('START');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('pacmanHighScore')) || 0);
    const animationIdRef = useRef(null);

    // Maze configuration (1 = wall, 0 = pellet, 2 = empty)
    const maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
        [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
        [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
        [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
        [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
        [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
        [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
        [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    const TILE_SIZE = 20;
    const pacmanRef = useRef({ x: 9, y: 15, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0, mouthSpeed: 0.1 });
    const ghostsRef = useRef([
        { x: 9, y: 8, color: '#ff0000', dir: { x: 1, y: 0 } },
        { x: 8, y: 9, color: '#ffb8ff', dir: { x: -1, y: 0 } },
        { x: 10, y: 9, color: '#00ffff', dir: { x: 1, y: 0 } },
        { x: 9, y: 10, color: '#ffb852', dir: { x: 0, y: -1 } }
    ]);
    const pelletsRef = useRef([]);

    const initPellets = () => {
        const p = [];
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 0) p.push({ x, y });
            }
        }
        pelletsRef.current = p;
    };

    const resetGame = () => {
        pacmanRef.current = { x: 9, y: 15, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0, mouthSpeed: 0.1 };
        ghostsRef.current = [
            { x: 9, y: 8, color: '#ff0000', dir: { x: 1, y: 0 } },
            { x: 8, y: 9, color: '#ffb8ff', dir: { x: -1, y: 0 } },
            { x: 10, y: 9, color: '#00ffff', dir: { x: 1, y: 0 } },
            { x: 9, y: 10, color: '#ffb852', dir: { x: 0, y: -1 } }
        ];
        initPellets();
        setScore(0);
        setGameState('START');
    };

    useEffect(() => {
        initPellets();
    }, []);

    const triggerGameOver = (currentScore) => {
        if (gameState === 'GAME_OVER') return;
        setGameState('GAME_OVER');
        if (currentScore > highScore) {
            setHighScore(currentScore);
            localStorage.setItem('pacmanHighScore', currentScore);
        }
        updateBalance(currentScore);
    };

    const update = () => {
        if (gameState !== 'PLAYING') return;

        const pacman = pacmanRef.current;
        
        // Try to change direction
        if (pacman.nextDir.x !== 0 || pacman.nextDir.y !== 0) {
            const nextX = pacman.x + pacman.nextDir.x;
            const nextY = pacman.y + pacman.nextDir.y;
            if (maze[nextY] && maze[nextY][nextX] !== 1) {
                pacman.dir = { ...pacman.nextDir };
                pacman.nextDir = { x: 0, y: 0 };
            }
        }

        // Move Pacman
        const newX = pacman.x + pacman.dir.x;
        const newY = pacman.y + pacman.dir.y;

        if (maze[newY] && maze[newY][newX] !== 1) {
            pacman.x = newX;
            pacman.y = newY;
            
            // Eat pellet
            const pelletIndex = pelletsRef.current.findIndex(p => p.x === pacman.x && p.y === pacman.y);
            if (pelletIndex !== -1) {
                pelletsRef.current.splice(pelletIndex, 1);
                setScore(s => s + 10);
                if (pelletsRef.current.length === 0) {
                    setGameState('GAME_OVER'); // Win!
                }
            }
        }

        // Pacman mouth animation
        pacman.mouth += pacman.mouthSpeed;
        if (pacman.mouth > 0.2 || pacman.mouth < 0) pacman.mouthSpeed *= -1;

        // Move Ghosts
        ghostsRef.current.forEach(ghost => {
            const possibleDirs = [
                { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
            ];
            
            // Only change direction if at an intersection (integer coordinates)
            const isAligned = Math.abs(ghost.x - Math.round(ghost.x)) < 0.1 && 
                              Math.abs(ghost.y - Math.round(ghost.y)) < 0.1;

            if (isAligned) {
                ghost.x = Math.round(ghost.x);
                ghost.y = Math.round(ghost.y);
                
                const currentNextX = ghost.x + ghost.dir.x;
                const currentNextY = ghost.y + ghost.dir.y;
                
                if (!maze[currentNextY] || maze[currentNextY][currentNextX] === 1 || Math.random() < 0.2) {
                    const validDirs = possibleDirs.filter(d => {
                        const nx = ghost.x + d.x;
                        const ny = ghost.y + d.y;
                        return maze[ny] && maze[ny][nx] !== 1;
                    });
                    if (validDirs.length > 0) {
                        ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                    }
                }
            }
            
            ghost.x += ghost.dir.x * 0.25; // Slower movement
            ghost.y += ghost.dir.y * 0.25;

            // Collision with Pacman
            const dx = ghost.x - pacman.x;
            const dy = ghost.y - pacman.y;
            if (Math.sqrt(dx*dx + dy*dy) < 0.7) {
                triggerGameOver(score);
            }
        });
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Maze
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = '#2121ff';
                    ctx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
            }
        }

        // Pellets
        pelletsRef.current.forEach(p => {
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(p.x * TILE_SIZE + TILE_SIZE/2, p.y * TILE_SIZE + TILE_SIZE/2, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Pacman
        const pacman = pacmanRef.current;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        const centerX = pacman.x * TILE_SIZE + TILE_SIZE/2;
        const centerY = pacman.y * TILE_SIZE + TILE_SIZE/2;
        
        let rotation = 0;
        if (pacman.dir.x === 1) rotation = 0;
        else if (pacman.dir.x === -1) rotation = Math.PI;
        else if (pacman.dir.y === 1) rotation = Math.PI/2;
        else if (pacman.dir.y === -1) rotation = -Math.PI/2;

        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, TILE_SIZE/2 - 2, rotation + pacman.mouth * Math.PI, rotation + (2 - pacman.mouth) * Math.PI);
        ctx.fill();

        // Ghosts
        ghostsRef.current.forEach(ghost => {
            ctx.fillStyle = ghost.color;
            const gx = ghost.x * TILE_SIZE + TILE_SIZE/2;
            const gy = ghost.y * TILE_SIZE + TILE_SIZE/2;
            
            ctx.beginPath();
            ctx.arc(gx, gy, TILE_SIZE/2 - 2, Math.PI, 0);
            ctx.lineTo(gx + TILE_SIZE/2 - 2, gy + TILE_SIZE/2 - 2);
            ctx.lineTo(gx - TILE_SIZE/2 + 2, gy + TILE_SIZE/2 - 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(gx - 4, gy - 2, 3, 0, Math.PI * 2);
            ctx.arc(gx + 4, gy - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(gx - 3, gy - 2, 1.5, 0, Math.PI * 2);
            ctx.arc(gx + 5, gy - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        if (gameState === 'GAME_OVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    useEffect(() => {
        let lastUpdate = 0;
        const loop = (timestamp) => {
            if (gameState === 'PLAYING') {
                if (timestamp - lastUpdate > 150) {
                    update();
                    lastUpdate = timestamp;
                }
            }
            draw();
            animationIdRef.current = requestAnimationFrame(loop);
        };
        animationIdRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationIdRef.current);
    }, [gameState]); // Only restart loop when gameState changes

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            if (gameState === 'START' && (e.code === 'Space' || e.code.startsWith('Arrow'))) {
                setGameState('PLAYING');
            }
            
            switch(e.code) {
                case 'ArrowUp': pacmanRef.current.nextDir = { x: 0, y: -1 }; break;
                case 'ArrowDown': pacmanRef.current.nextDir = { x: 0, y: 1 }; break;
                case 'ArrowLeft': pacmanRef.current.nextDir = { x: -1, y: 0 }; break;
                case 'ArrowRight': pacmanRef.current.nextDir = { x: 1, y: 0 }; break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    return (
        <GameWrapper title="Pac-Man">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '3rem', color: '#f1c40f', fontSize: '1.5rem', fontWeight: 800 }}>
                    <div>Score: {score}</div>
                    <div>Best: {highScore}</div>
                </div>

                <div style={{ position: 'relative', width: 'fit-content', background: '#000', padding: '10px', borderRadius: '12px', border: '4px solid #2121ff' }}>
                    <canvas 
                        ref={canvasRef} 
                        width={19 * TILE_SIZE} 
                        height={19 * TILE_SIZE} 
                        style={{ display: 'block' }}
                    />
                    
                    {gameState === 'START' && (
                        <div style={{ 
                            position: 'absolute', 
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '12px'
                        }}>
                            <h2 style={{ color: '#f1c40f', fontSize: '2.5rem', marginBottom: '1rem' }}>Ready?</h2>
                            <button onClick={() => setGameState('PLAYING')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1c40f', color: '#000' }}>
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
                            <h2 style={{ color: '#f1c40f', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Game Over</h2>
                            <p style={{ color: '#fff', marginBottom: '1.5rem' }}>Earned: <span style={{ color: '#FFD700', fontWeight: 600 }}>+{score}</span> Z Coins</p>
                            <button onClick={resetGame} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1c40f', color: '#000' }}>
                                <RotateCcw size={20} /> Play Again
                            </button>
                        </div>
                    )}
                </div>

                <p style={{ color: '#777', fontSize: '1.1rem' }}>Use Arrow Keys to Move</p>
            </div>
        </GameWrapper>
    );
};

export default Pacman;
