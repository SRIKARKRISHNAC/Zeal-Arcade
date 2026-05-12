import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { useGame } from '../../context/GameContext';
import { ChevronLeft, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DIRS = [
    { dr: -1, dc: 0, id: 'U' },
    { dr: 1, dc: 0, id: 'D' },
    { dr: 0, dc: -1, id: 'L' },
    { dr: 0, dc: 1, id: 'R' }
];

const Arrows = () => {
    const { balance, updateBalance } = useGame();
    const [level, setLevel] = useState(parseInt(localStorage.getItem('arrowsLevel')) || 1);
    const [hearts, setHearts] = useState(5);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    
    const canvasRef = useRef(null);
    const linesRef = useRef([]);
    const animationIdRef = useRef(null);
    const NRef = useRef(20);

    const getCost = (lvl) => {
        if (lvl === 1) return 0;
        return Math.floor(lvl / 2) * 10;
    };

    const initPuzzle = (lvl) => {
        let n = 20;
        let targetLines = 0;
        if (lvl < 5) {
            n = 20;
            targetLines = 100 + (lvl * 25);
        } else if (lvl < 10) {
            n = 25;
            targetLines = 250 + (lvl - 5) * 15;
        } else {
            n = 30;
            targetLines = 400 + (lvl - 10) * 10;
        }
        NRef.current = n;
        linesRef.current = generatePuzzle(n, targetLines);
        setIsWin(false);
        setIsGameOver(false);
        setHearts(5);
    };

    const generatePuzzle = (size, numLines) => {
        let generated = [];
        let occupied = Array(size).fill(0).map(() => Array(size).fill(false));

        for (let i = 0; i < numLines; i++) {
            let dir = DIRS[Math.floor(Math.random() * 4)];
            let safeHeads = [];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (occupied[r][c]) continue;
                    let rayR = r + dir.dr;
                    let rayC = c + dir.dc;
                    let isSafe = true;
                    while (rayR >= 0 && rayR < size && rayC >= 0 && rayC < size) {
                        if (occupied[rayR][rayC]) {
                            isSafe = false;
                            break;
                        }
                        rayR += dir.dr;
                        rayC += dir.dc;
                    }
                    if (isSafe) safeHeads.push({ r, c });
                }
            }

            if (safeHeads.length === 0) break;
            safeHeads.sort(() => Math.random() - 0.5);

            let placed = false;
            for (let head of safeHeads) {
                let backR = head.r - dir.dr;
                let backC = head.c - dir.dc;
                if (backR >= 0 && backR < size && backC >= 0 && backC < size && !occupied[backR][backC]) {
                    let body = [{ r: backR, c: backC }, head];
                    let current = { r: backR, c: backC };
                    let length = 2;
                    let maxLen = Math.floor(Math.random() * 6) + 3;
                    while (length < maxLen) {
                        let neighbors = [];
                        for (let d of DIRS) {
                            let nr = current.r + d.dr;
                            let nc = current.c + d.dc;
                            if (nr >= 0 && nr < size && nc >= 0 && nc < size && !occupied[nr][nc] && !body.find(p => p.r === nr && p.c === nc)) {
                                neighbors.push({ r: nr, c: nc });
                            }
                        }
                        if (neighbors.length === 0) break;
                        let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                        body.unshift(next);
                        current = next;
                        length++;
                    }
                    for (let p of body) occupied[p.r][p.c] = true;
                    generated.push({
                        id: i, body, dir, slideDistance: 0, isRemoving: false, removed: false, isError: false, errorStartTime: null, removeStartTime: null
                    });
                    placed = true;
                    break;
                }
            }
            if (!placed) break;
        }
        return generated.reverse();
    };

    const getCoord = (p, cellSize) => ({
        x: p.c * cellSize + cellSize / 2,
        y: p.r * cellSize + cellSize / 2
    });

    const getPathPos = (line, d) => {
        let pts = line.body;
        let n = pts.length - 1;
        if (d <= 0) return pts[0];
        if (d < n) {
            let index = Math.floor(d);
            let t = d - index;
            return {
                r: pts[index].r + (pts[index + 1].r - pts[index].r) * t,
                c: pts[index].c + (pts[index + 1].c - pts[index].c) * t
            };
        } else {
            let over = d - n;
            return {
                r: pts[n].r + line.dir.dr * over,
                c: pts[n].c + line.dir.dc * over
            };
        }
    };

    const getSnakePoints = (line) => {
        let pts = line.body;
        let L = pts.length - 1;
        let D = line.slideDistance;
        let dStart = D;
        let dEnd = L + D;
        let result = [];
        result.push(getPathPos(line, dStart));
        let firstInt = Math.floor(dStart) + 1;
        let lastInt = Math.ceil(dEnd) - 1;
        for (let i = firstInt; i <= lastInt; i++) result.push(getPathPos(line, i));
        if (dEnd > dStart) result.push(getPathPos(line, dEnd));
        let clean = [result[0]];
        for (let i = 1; i < result.length; i++) {
            let prev = clean[clean.length - 1];
            let curr = result[i];
            let dist = Math.abs(curr.r - prev.r) + Math.abs(curr.c - prev.c);
            if (dist > 0.001) clean.push(curr);
        }
        return clean;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const N = NRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let cellSize = canvas.width / N;
        let radius = cellSize * 0.4;
        let allRemoved = true;
        let now = performance.now();

        let grid = Array(N).fill(0).map(() => Array(N).fill(null));
        for (let line of linesRef.current) {
            if (line.removed || line.isRemoving) continue;
            for (let p of line.body) {
                if (p.r >= 0 && p.r < N && p.c >= 0 && p.c < N) grid[p.r][p.c] = line;
            }
        }

        // Trajectories
        for (let line of linesRef.current) {
            if (line.removed || line.isRemoving) continue;
            let head = line.body[line.body.length - 1];
            let endR = head.r + line.dir.dr;
            let endC = head.c + line.dir.dc;
            let hitBlocker = false;
            while (endR >= 0 && endR < N && endC >= 0 && endC < N) {
                let blocker = grid[endR][endC];
                if (blocker && blocker !== line) { hitBlocker = true; break; }
                endR += line.dir.dr;
                endC += line.dir.dc;
            }
            let startP = getCoord(head, cellSize);
            let endP = getCoord({ r: endR, c: endC }, cellSize);
            if (hitBlocker) { endP.x -= line.dir.dc * cellSize * 0.4; endP.y -= line.dir.dr * cellSize * 0.4; }
            else { endP.x += line.dir.dc * cellSize * 0.5; endP.y += line.dir.dr * cellSize * 0.5; }

            ctx.beginPath();
            ctx.setLineDash([cellSize * 0.05, cellSize * 0.15]);
            ctx.moveTo(startP.x + line.dir.dc * cellSize * 0.4, startP.y + line.dir.dr * cellSize * 0.4);
            ctx.lineTo(endP.x, endP.y);
            ctx.lineWidth = cellSize * 0.1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Arrows
        for (let line of linesRef.current) {
            if (line.removed) continue;
            allRemoved = false;
            if (line.isRemoving) {
                if (!line.removeStartTime) line.removeStartTime = now;
                let t = (now - line.removeStartTime) / 400;
                if (t > 1) { line.removed = true; continue; }
                line.slideDistance = (t * t * t) * (N * 1.5);
            } else if (line.isError) {
                if (!line.errorStartTime) line.errorStartTime = now;
                let t = (now - line.errorStartTime) / 400;
                if (t > 1) { line.isError = false; line.errorStartTime = null; line.slideDistance = 0; }
                else { line.slideDistance = Math.sin(t * Math.PI) * 0.4; }
            }

            ctx.beginPath();
            ctx.strokeStyle = line.isError ? '#ef4444' : '#e8d5f0';
            ctx.lineWidth = cellSize * 0.3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            let pts = getSnakePoints(line);
            let p0 = getCoord(pts[0], cellSize);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < pts.length - 1; i++) {
                let p1 = getCoord(pts[i], cellSize);
                let p2 = getCoord(pts[i + 1], cellSize);
                ctx.arcTo(p1.x, p1.y, p2.x, p2.y, radius);
            }
            let pLast = getCoord(pts[pts.length - 1], cellSize);
            if (pts.length > 1) ctx.lineTo(pLast.x, pLast.y);
            else ctx.lineTo(p0.x, p0.y);
            ctx.stroke();

            ctx.save();
            ctx.translate(pLast.x, pLast.y);
            let angle = 0;
            if (line.dir.id === 'U') angle = -Math.PI / 2;
            if (line.dir.id === 'D') angle = Math.PI / 2;
            if (line.dir.id === 'L') angle = Math.PI;
            if (line.dir.id === 'R') angle = 0;
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(cellSize * 0.35, 0);
            ctx.lineTo(-cellSize * 0.25, cellSize * 0.35);
            ctx.lineTo(-cellSize * 0.25, -cellSize * 0.35);
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
            ctx.restore();
        }

        if (allRemoved && linesRef.current.length > 0) {
            setIsWin(true);
            return;
        }
        animationIdRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        const cost = getCost(level);
        if (cost === 0) {
            initPuzzle(level);
        } else {
            setShowPayment(true);
        }
        return () => cancelAnimationFrame(animationIdRef.current);
    }, [level]);

    useEffect(() => {
        if (!showPayment && !isWin && !isGameOver) {
            animationIdRef.current = requestAnimationFrame(draw);
        }
        return () => cancelAnimationFrame(animationIdRef.current);
    }, [showPayment, isWin, isGameOver]);

    const handleCanvasClick = (e) => {
        if (isWin || isGameOver) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const cellSize = canvas.width / NRef.current;
        const c = Math.floor(x / cellSize);
        const r = Math.floor(y / cellSize);

        const clickedLine = linesRef.current.find(l => !l.isRemoving && !l.removed && l.body.some(p => p.r === r && p.c === c));
        if (clickedLine) {
            const canFly = () => {
                let head = clickedLine.body[clickedLine.body.length - 1];
                let dr = head.r + clickedLine.dir.dr;
                let dc = head.c + clickedLine.dir.dc;
                while (dr >= 0 && dr < NRef.current && dc >= 0 && dc < NRef.current) {
                    if (linesRef.current.some(l => l !== clickedLine && !l.isRemoving && !l.removed && l.body.some(p => p.r === dr && p.c === dc))) return false;
                    dr += clickedLine.dir.dr;
                    dc += clickedLine.dir.dc;
                }
                return true;
            };

            if (canFly()) {
                clickedLine.isRemoving = true;
            } else if (!clickedLine.isError) {
                clickedLine.isError = true;
                clickedLine.errorStartTime = null;
                setHearts(h => {
                    const newH = h - 1;
                    if (newH <= 0) setIsGameOver(true);
                    return newH;
                });
            }
        }
    };

    const handlePay = () => {
        const cost = getCost(level);
        if (balance >= cost) {
            updateBalance(-cost);
            setShowPayment(false);
            initPuzzle(level);
        } else {
            alert("Not enough Z Coins!");
        }
    };

    const handleNextLevel = () => {
        const cost = getCost(level);
        updateBalance(cost + 20); // Reward
        const nextLvl = level + 1;
        setIsWin(false);
        setIsGameOver(false);
        setHearts(5);
        setLevel(nextLvl);
        localStorage.setItem('arrowsLevel', nextLvl);
    };

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <Link to="/arcade" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                        <ChevronLeft />
                    </Link>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>Level {level}</h2>
                        <div style={{ fontSize: '1.2rem', letterSpacing: '4px' }}>
                            {'❤️'.repeat(hearts)}{'🤍'.repeat(5 - hearts)}
                        </div>
                    </div>
                    <div style={{ width: '40px' }} />
                </div>

                <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
                    <canvas 
                        ref={canvasRef} 
                        width="800" 
                        height="800" 
                        style={{ width: '100%', height: 'auto', borderRadius: '12px', cursor: 'pointer', display: 'block' }}
                        onClick={handleCanvasClick}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn-secondary" onClick={() => initPuzzle(level)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', padding: '0.8rem 1.5rem' }}>
                        <RotateCcw size={18} /> Restart Level
                    </button>
                </div>

                {showPayment && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Unlock Level {level}</h2>
                            <p>Entry Fee: <span style={{ color: '#FFD700', fontWeight: 800 }}>{getCost(level)} Z Coins</span></p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Balance: <span style={{ color: '#FFD700' }}>{balance}</span> Z Coins</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button className="btn-primary" onClick={handlePay}>Pay & Play</button>
                                <Link to="/arcade" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>Cancel</Link>
                            </div>
                        </div>
                    </div>
                )}

                {isWin && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Level Complete!</h2>
                            <p>You cleared all arrows and earned <span style={{ color: '#FFD700', fontWeight: 800 }}>{getCost(level) + 20} Z Coins</span>!</p>
                            <button className="btn-primary" onClick={handleNextLevel} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem auto 0' }}>
                                Next Level <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {isGameOver && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Game Over</h2>
                            <p>You ran out of hearts!</p>
                            <button className="btn-primary" onClick={() => initPuzzle(level)} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem auto 0' }}>
                                <RotateCcw size={18} /> Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Arrows;
