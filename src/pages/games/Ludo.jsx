import React, { useState, useEffect } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';

const TRACK_COORDS = [
    {r: 7, c: 2}, {r: 7, c: 3}, {r: 7, c: 4}, {r: 7, c: 5}, {r: 7, c: 6},
    {r: 6, c: 7}, {r: 5, c: 7}, {r: 4, c: 7}, {r: 3, c: 7}, {r: 2, c: 7}, {r: 1, c: 7},
    {r: 1, c: 8}, {r: 1, c: 9},
    {r: 2, c: 9}, {r: 3, c: 9}, {r: 4, c: 9}, {r: 5, c: 9}, {r: 6, c: 9},
    {r: 7, c: 10}, {r: 7, c: 11}, {r: 7, c: 12}, {r: 7, c: 13}, {r: 7, c: 14}, {r: 7, c: 15},
    {r: 8, c: 15}, {r: 9, c: 15},
    {r: 9, c: 14}, {r: 9, c: 13}, {r: 9, c: 12}, {r: 9, c: 11}, {r: 9, c: 10},
    {r: 10, c: 9}, {r: 11, c: 9}, {r: 12, c: 9}, {r: 13, c: 9}, {r: 14, c: 9}, {r: 15, c: 9},
    {r: 15, c: 8}, {r: 15, c: 7},
    {r: 14, c: 7}, {r: 13, c: 7}, {r: 12, c: 7}, {r: 11, c: 7}, {r: 10, c: 7},
    {r: 9, c: 6}, {r: 9, c: 5}, {r: 9, c: 4}, {r: 9, c: 3}, {r: 9, c: 2}, {r: 9, c: 1},
    {r: 8, c: 1}, {r: 7, c: 1}
];

const PATHS = {
    green: TRACK_COORDS.slice(0, 51).concat([{r: 8, c: 2}, {r: 8, c: 3}, {r: 8, c: 4}, {r: 8, c: 5}, {r: 8, c: 6}]),
    yellow: TRACK_COORDS.slice(13, 52).concat(TRACK_COORDS.slice(0, 12)).concat([{r: 2, c: 8}, {r: 3, c: 8}, {r: 4, c: 8}, {r: 5, c: 8}, {r: 6, c: 8}]),
    blue: TRACK_COORDS.slice(26, 52).concat(TRACK_COORDS.slice(0, 25)).concat([{r: 8, c: 14}, {r: 8, c: 13}, {r: 8, c: 12}, {r: 8, c: 11}, {r: 8, c: 10}]),
    red: TRACK_COORDS.slice(39, 52).concat(TRACK_COORDS.slice(0, 38)).concat([{r: 14, c: 8}, {r: 13, c: 8}, {r: 12, c: 8}, {r: 11, c: 8}, {r: 10, c: 8}])
};

const BASE_COORDS = {
    red: [{r: 12, c: 3}, {r: 12, c: 4}, {r: 13, c: 3}, {r: 13, c: 4}],
    green: [{r: 3, c: 3}, {r: 3, c: 4}, {r: 4, c: 3}, {r: 4, c: 4}],
    blue: [{r: 12, c: 12}, {r: 12, c: 13}, {r: 13, c: 12}, {r: 13, c: 13}],
    yellow: [{r: 3, c: 12}, {r: 3, c: 13}, {r: 4, c: 12}, {r: 4, c: 13}]
};

const Ludo = () => {
    const { user, updateBalance } = useGame();
    const [gamePhase, setGamePhase] = useState('SETUP'); // SETUP, PLAYING
    const [numHumanPlayers, setNumHumanPlayers] = useState(1);
    const [playerConfigs, setPlayerConfigs] = useState([
        { name: user || 'Player 1', color: 'red', isAI: false },
        { name: 'AI 1', color: 'green', isAI: true },
        { name: 'AI 2', color: 'blue', isAI: true },
        { name: 'AI 3', color: 'yellow', isAI: true }
    ]);

    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [status, setStatus] = useState("");
    const [isRolling, setIsRolling] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [waitingForChoice, setWaitingForChoice] = useState(false);

    const availableColors = ['red', 'green', 'blue', 'yellow'];

    const handleSetupSubmit = () => {
        const initialPlayers = playerConfigs.map(config => ({
            ...config,
            pawns: [
                { pos: -1, finished: false },
                { pos: -1, finished: false },
                { pos: -1, finished: false },
                { pos: -1, finished: false }
            ]
        }));
        setPlayers(initialPlayers);
        setGamePhase('PLAYING');
        setCurrentTurn(0);
        setStatus(`${initialPlayers[0].name}'s turn! Roll the dice!`);
    };

    const updateHumanCount = (count) => {
        setNumHumanPlayers(count);
        const newConfigs = [...playerConfigs];
        for (let i = 0; i < 4; i++) {
            if (i < count) {
                newConfigs[i].isAI = false;
                if (newConfigs[i].name.startsWith('AI')) newConfigs[i].name = `Player ${i + 1}`;
            } else {
                newConfigs[i].isAI = true;
                newConfigs[i].name = `AI ${i - count + 1}`;
            }
        }
        setPlayerConfigs(newConfigs);
    };

    const updatePlayerConfig = (index, field, value) => {
        const newConfigs = [...playerConfigs];
        newConfigs[index][field] = value;
        setPlayerConfigs(newConfigs);
    };

    const rollDice = () => {
        if (isRolling || isGameOver || gamePhase !== 'PLAYING' || waitingForChoice) return;
        setIsRolling(true);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        
        let rolls = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                setDiceValue(finalRoll);
                processRoll(finalRoll);
            }
        }, 50);
    };

    const processRoll = (roll) => {
        const p = players[currentTurn];
        const movablePawns = getMovablePawns(p, roll);

        if (movablePawns.length === 0) {
            setStatus(`${p.name} rolled a ${roll}. No moves possible!`);
            setTimeout(() => {
                nextTurn();
                setIsRolling(false);
            }, 1000);
        } else if (movablePawns.length === 1 && (p.isAI || roll !== 6 || p.pawns.filter(pn => pn.pos >= 0).length === 0)) {
            // Auto-move if only one option (and not a choice between track/base for humans)
            movePawn(movablePawns[0], roll);
        } else {
            setStatus(`${p.name}, choose a pawn to move!`);
            setWaitingForChoice(true);
            if (p.isAI) {
                // AI chooses a pawn after a delay
                setTimeout(() => {
                    const choice = aiChoosePawn(p, movablePawns, roll);
                    movePawn(choice, roll);
                }, 1000);
            }
        }
    };

    const getMovablePawns = (player, roll) => {
        return player.pawns.reduce((acc, pawn, idx) => {
            if (pawn.finished) return acc;
            if (pawn.pos === -1 && roll === 6) acc.push(idx);
            else if (pawn.pos >= 0) {
                if (pawn.pos + roll < PATHS[player.color].length) acc.push(idx);
            }
            return acc;
        }, []);
    };

    const aiChoosePawn = (player, movableIndices, roll) => {
        // Priority: 1. Finish a pawn, 2. Move furthest pawn, 3. Bring out new pawn
        const finishers = movableIndices.filter(idx => player.pawns[idx].pos + roll === PATHS[player.color].length - 1);
        if (finishers.length > 0) return finishers[0];

        const onTrack = movableIndices.filter(idx => player.pawns[idx].pos >= 0);
        if (onTrack.length > 0) {
            return onTrack.reduce((prev, curr) => (player.pawns[curr].pos > player.pawns[prev].pos ? curr : prev));
        }

        return movableIndices[0];
    };

    const movePawn = (pawnIdx, roll) => {
        const p = players[currentTurn];
        const newPlayers = [...players];
        const pawn = newPlayers[currentTurn].pawns[pawnIdx];
        
        let nextPos;
        if (pawn.pos === -1) {
            nextPos = 0;
        } else {
            nextPos = pawn.pos + roll;
        }

        pawn.pos = nextPos;
        if (nextPos === PATHS[p.color].length - 1) {
            pawn.finished = true;
            if (!p.isAI) updateBalance(100); // Larger reward for full finish
            setStatus(`${p.name} finished a pawn! 🎉`);
        } else {
            setStatus(`${p.name} moved a pawn!`);
        }

        setPlayers(newPlayers);
        setWaitingForChoice(false);
        
        setTimeout(() => {
            if (roll === 6 && !newPlayers[currentTurn].pawns.every(pn => pn.finished)) {
                setStatus(`${p.name} rolled a 6! Roll again! 🎲`);
                setIsRolling(false);
            } else {
                nextTurn(newPlayers);
                setIsRolling(false);
            }
        }, 1000);
    };

    const nextTurn = (currentPlayers = players) => {
        if (currentPlayers.every(p => p.pawns.every(pn => pn.finished))) {
            setIsGameOver(true);
            setStatus("Game Over! All players finished!");
            return;
        }

        let nextIdx = (currentTurn + 1) % 4;
        while (currentPlayers[nextIdx].pawns.every(pn => pn.finished)) {
            nextIdx = (nextIdx + 1) % 4;
        }
        
        setCurrentTurn(nextIdx);
        const nextPlayer = currentPlayers[nextIdx];
        setStatus(`${nextPlayer.name}'s turn!`);
    };

    const handlePawnClick = (pIdx) => {
        if (!waitingForChoice || players[currentTurn].isAI) return;
        const movable = getMovablePawns(players[currentTurn], diceValue);
        if (movable.includes(pIdx)) {
            movePawn(pIdx, diceValue);
        }
    };

    const resetGame = () => {
        setGamePhase('SETUP');
        setIsGameOver(false);
        setDiceValue(null);
        setWaitingForChoice(false);
    };

    const getTokenStyle = (color) => {
        switch(color) {
            case 'red': return 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)';
            case 'green': return 'radial-gradient(circle at 30% 30%, #22c55e, #14532d)';
            case 'yellow': return 'radial-gradient(circle at 30% 30%, #eab308, #713f12)';
            case 'blue': return 'radial-gradient(circle at 30% 30%, #3b82f6, #1e3a8a)';
            default: return 'white';
        }
    };

    if (gamePhase === 'SETUP') {
        return (
            <GameWrapper title="Ludo Setup">
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }} className="glass-card">
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#9b59b6' }}>Game Settings</h2>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Number of Human Players:</label>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {[1, 2, 3, 4].map(n => (
                                <button 
                                    key={n}
                                    onClick={() => updateHumanCount(n)}
                                    style={{
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #9b59b6',
                                        background: numHumanPlayers === n ? '#9b59b6' : 'transparent',
                                        color: numHumanPlayers === n ? 'white' : '#9b59b6',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {playerConfigs.map((config, i) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                alignItems: 'center',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderLeft: `6px solid ${config.color}`
                            }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', color: '#aaa' }}>{config.isAI ? `AI ${i - numHumanPlayers + 1}` : `Player ${i + 1}`}</label>
                                    <input 
                                        type="text" 
                                        value={config.name}
                                        disabled={config.isAI}
                                        onChange={(e) => updatePlayerConfig(i, 'name', e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            marginTop: '0.2rem'
                                        }}
                                    />
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Color</label>
                                    <select 
                                        value={config.color}
                                        onChange={(e) => updatePlayerConfig(i, 'color', e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            marginTop: '0.2rem'
                                        }}
                                    >
                                        {availableColors.map(c => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleSetupSubmit}
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: '2rem', fontSize: '1.2rem' }}
                    >
                        Start Game
                    </button>
                </div>
            </GameWrapper>
        );
    }

    return (
        <GameWrapper title="Ludo">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    color: players[currentTurn] ? (
                           players[currentTurn].color === 'red' ? '#ef4444' : 
                           players[currentTurn].color === 'green' ? '#22c55e' :
                           players[currentTurn].color === 'yellow' ? '#eab308' : '#3b82f6'
                    ) : '#fff',
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

                <div style={{ padding: '25px 0' }}>
                    <div style={{ 
                        position: 'relative',
                        width: 'min(100vw, 500px)',
                        aspectRatio: '1',
                        backgroundImage: 'url("/ludo-board.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '4px solid #4a235a',
                        borderRadius: '12px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(15, 1fr)',
                        gridTemplateRows: 'repeat(15, 1fr)'
                    }}>
                        {players.map((player, pIdx) => (
                            player.pawns.map((pawn, pnIdx) => {
                                const coord = pawn.pos === -1 ? BASE_COORDS[player.color][pnIdx] : (PATHS[player.color] ? PATHS[player.color][pawn.pos] : null);
                                if (!coord) return null;
                                
                                const isMovable = waitingForChoice && currentTurn === pIdx && !player.isAI && getMovablePawns(player, diceValue).includes(pnIdx);

                                return (
                                    <div 
                                        key={`${player.color}-${pnIdx}`} 
                                        onClick={() => handlePawnClick(pnIdx)}
                                        style={{ 
                                            gridArea: `${coord.r} / ${coord.c} / ${coord.r + 1} / ${coord.c + 1}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10 + pnIdx + (pIdx * 4),
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            position: 'relative',
                                            cursor: isMovable ? 'pointer' : 'default'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '70%',
                                            height: '70%',
                                            background: getTokenStyle(player.color),
                                            borderRadius: '50%',
                                            boxShadow: isMovable ? '0 0 10px #fff, 0 4px 8px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.4)',
                                            border: isMovable ? '2px solid white' : '1px solid white',
                                            opacity: pawn.finished ? 0.3 : 1,
                                            zIndex: 2,
                                            animation: isMovable ? 'pulse 1s infinite' : 'none'
                                        }} />
                                        {(pawn.pos >= 0 || (pawn.pos === -1 && pnIdx === 0)) && (
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '-18px', 
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                fontSize: '0.6rem', 
                                                fontWeight: 'bold',
                                                background: 'rgba(0,0,0,0.8)', 
                                                color: 'white',
                                                padding: '1px 5px', 
                                                borderRadius: '8px',
                                                whiteSpace: 'nowrap',
                                                zIndex: 20, // High z-index for names
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                border: `1px solid ${player.color === 'yellow' ? '#f1c40f' : player.color}`,
                                                pointerEvents: 'none'
                                            }}>
                                                {player.name}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button 
                        onClick={rollDice} 
                        disabled={isRolling || isGameOver || (players[currentTurn] && players[currentTurn].isAI) || waitingForChoice}
                        className="btn-primary"
                        style={{ 
                            fontSize: '1.2rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #6c3483, #4a235a)',
                            opacity: (isRolling || isGameOver || (players[currentTurn] && players[currentTurn].isAI) || waitingForChoice) ? 0.6 : 1
                        }}
                    >
                        {isGameOver ? 'Game Over' : (waitingForChoice && !players[currentTurn].isAI ? 'Choose Pawn' : (players[currentTurn] && players[currentTurn].isAI ? 'AI Thinking...' : 'Roll Dice 🎲'))}
                    </button>

                    <div style={{ 
                        width: '60px',
                        height: '60px',
                        background: 'rgba(155, 89, 182, 0.1)',
                        border: '2px solid #9b59b6',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#9b59b6',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                        {diceValue || '-'}
                    </div>

                    {isGameOver && (
                        <button onClick={resetGame} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RotateCcw size={18} /> New Game
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </GameWrapper>
    );
};

export default Ludo;
