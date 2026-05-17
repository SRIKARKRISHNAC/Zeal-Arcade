import React, { useState, useEffect } from 'react';
import { Chess as ChessJS } from 'chess.js';
import GameWrapper from '../../components/GameWrapper';
import { useGame } from '../../context/GameContext';
import { RotateCcw } from 'lucide-react';
import boardImg from '../../assets/chess board.jpg';

const PIECE_ICONS = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
    'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
};

const Chess = () => {
    const { updateBalance } = useGame();
    const [game, setGame] = useState(new ChessJS());
    const [board, setBoard] = useState(game.board());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [status, setStatus] = useState("Your turn (White)");
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSearching, setIsSearching] = useState(true);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [difficulty, setDifficulty] = useState('Medium');

    useEffect(() => {
        const timer = setTimeout(() => setIsSearching(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const updateStatus = (currentGame) => {
        if (currentGame.isCheckmate()) {
            setIsGameOver(true);
            if (currentGame.turn() === 'w') {
                setStatus("Checkmate! You lose.");
            } else {
                setStatus("Checkmate! You win!");
                updateBalance(200);
            }
            return;
        }

        if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition()) {
            setIsGameOver(true);
            setStatus("Game drawn!");
            return;
        }

        if (currentGame.isCheck()) {
            setStatus("Check!");
            return;
        }

        if (currentGame.turn() === 'w') {
            setStatus("Your turn (White)");
        } else {
            setStatus("Opponent thinking...");
        }
    };

    const PIECE_VALUES = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

    const evaluateBoard = (gameInstance) => {
        let score = 0;
        const boardState = gameInstance.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece) {
                    const centerBonus = (r >= 3 && r <= 4 && c >= 3 && c <= 4) ? 1 : 0;
                    const val = PIECE_VALUES[piece.type] + centerBonus;
                    score += piece.color === 'w' ? val : -val;
                }
            }
        }
        return score;
    };

    const getBestMove = (gameInstance, depth) => {
        const moves = gameInstance.moves({ verbose: true });
        if (moves.length === 0) return null;
        if (depth === 0) return moves[Math.floor(Math.random() * moves.length)];

        let bestMove = null;
        let bestValue = Infinity;

        const minimax = (gameCopy, depthLeft, alpha, beta, isMaximizing) => {
            if (depthLeft === 0 || gameCopy.isGameOver()) return evaluateBoard(gameCopy);
            const possibleMoves = gameCopy.moves({ verbose: true });
            
            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of possibleMoves) {
                    gameCopy.move(move);
                    const ev = minimax(gameCopy, depthLeft - 1, alpha, beta, false);
                    gameCopy.undo();
                    maxEval = Math.max(maxEval, ev);
                    alpha = Math.max(alpha, ev);
                    if (beta <= alpha) break;
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (let move of possibleMoves) {
                    gameCopy.move(move);
                    const ev = minimax(gameCopy, depthLeft - 1, alpha, beta, true);
                    gameCopy.undo();
                    minEval = Math.min(minEval, ev);
                    beta = Math.min(beta, ev);
                    if (beta <= alpha) break;
                }
                return minEval;
            }
        };

        moves.sort(() => Math.random() - 0.5);
        for (let move of moves) {
            gameInstance.move(move);
            const boardValue = minimax(gameInstance, depth - 1, -Infinity, Infinity, true);
            gameInstance.undo();
            
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        return bestMove || moves[0];
    };

    const makeAIMove = (currentGame) => {
        if (currentGame.isGameOver()) return;

        let depth = 0;
        if (difficulty === 'Medium') depth = 1;
        if (difficulty === 'Hard') depth = 3;

        const move = getBestMove(currentGame, depth);
        if (move) {
            currentGame.move(move);
            setGame(new ChessJS(currentGame.fen()));
            setBoard(currentGame.board());
            updateStatus(currentGame);
        }
    };

    const handleSquareClick = (r, c) => {
        if (isGameOver || game.turn() === 'b' || isSearching) return;

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const square = files[c] + (8 - r);
        const piece = game.get(square);

        if (selectedSquare) {
            if (selectedSquare === square) {
                setSelectedSquare(null);
                setPossibleMoves([]);
                return;
            }

            // Try to move
            try {
                let targetSquare = square;
                const selectedPiece = game.get(selectedSquare);
                // Allow castling by clicking the Rook
                if (selectedPiece && selectedPiece.type === 'k' && piece && piece.type === 'r' && piece.color === selectedPiece.color) {
                    if (square === 'h1' && selectedSquare === 'e1') targetSquare = 'g1';
                    if (square === 'a1' && selectedSquare === 'e1') targetSquare = 'c1';
                    if (square === 'h8' && selectedSquare === 'e8') targetSquare = 'g8';
                    if (square === 'a8' && selectedSquare === 'e8') targetSquare = 'c8';
                }

                // If promotion is possible, auto-promote to queen for simplicity
                const moves = game.moves({ square: selectedSquare, verbose: true });
                const moveObj = moves.find(m => m.to === targetSquare);
                
                if (moveObj) {
                    const gameCopy = new ChessJS(game.fen());
                    gameCopy.move({
                        from: selectedSquare,
                        to: targetSquare,
                        promotion: 'q'
                    });

                    setGame(gameCopy);
                    setBoard(gameCopy.board());
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                    updateStatus(gameCopy);

                    if (!gameCopy.isGameOver()) {
                        setTimeout(() => makeAIMove(gameCopy), 1000);
                    }
                } else {
                    // Invalid move
                    if (piece && piece.color === 'w') {
                        setSelectedSquare(square);
                        setPossibleMoves(game.moves({ square, verbose: true }).map(m => m.to));
                    } else {
                        setSelectedSquare(null);
                        setPossibleMoves([]);
                    }
                }
            } catch (e) {
                console.error("Invalid move", e);
            }
        } else {
            if (piece && piece.color === 'w') {
                setSelectedSquare(square);
                setPossibleMoves(game.moves({ square, verbose: true }).map(m => m.to));
            }
        }
    };

    const resetGame = () => {
        const newGame = new ChessJS();
        setGame(newGame);
        setBoard(newGame.board());
        setSelectedSquare(null);
        setPossibleMoves([]);
        setStatus("Your turn (White)");
        setIsGameOver(false);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 1500);
    };

    // Helper to get piece string for rendering
    const getPieceDisplay = (p) => {
        if (!p) return null;
        return p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
    };

    return (
        <GameWrapper title="Chess">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    background: 'rgba(155, 89, 182, 0.1)',
                    border: '1px solid rgba(155, 89, 182, 0.2)'
                }}>
                    {isSearching ? "Searching for opponent..." : status}
                </div>

                <div style={{
                    position: 'relative',
                    width: 'min(90vw, 550px)',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    backgroundImage: `url(${boardImg})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    padding: '4.8% 5.2%' // Fine-tuned to align with the board area in the JPEG
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gridTemplateRows: 'repeat(8, 1fr)',
                        height: '100%',
                        width: '100%'
                    }}>
                        {board.map((row, r) => (
                            row.map((piece, c) => {
                                const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                                const square = files[c] + (8 - r);
                                const isSelected = selectedSquare === square;
                                const isPossibleMove = possibleMoves.includes(square);
                                const pStr = getPieceDisplay(piece);

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleSquareClick(r, c)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            boxShadow: isSelected ? 'inset 0 0 0 4px rgba(155, 89, 182, 0.8)' : 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        {isPossibleMove && (
                                            <div style={{
                                                position: 'absolute',
                                                width: '30%',
                                                height: '30%',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(155, 89, 182, 0.6)',
                                                zIndex: 1
                                            }} />
                                        )}
                                        {pStr && (
                                            <span style={{
                                                color: piece.color === 'w' ? '#ffffff' : '#1a1a1a',
                                                fontSize: 'min(7vw, 40px)',
                                                lineHeight: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                filter: piece.color === 'w' ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' : 'none',
                                                userSelect: 'none',
                                                transition: 'transform 0.2s ease',
                                                zIndex: 2
                                            }}>
                                                {PIECE_ICONS[pStr]}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ))}

                        {isSearching && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.6)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)',
                                borderRadius: '12px',
                                zIndex: 10
                            }}>
                                <div className="loader" style={{
                                    width: '50px',
                                    height: '50px',
                                    border: '4px solid #fff',
                                    borderTopColor: 'var(--accent-primary)',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginBottom: '1rem'
                                }} />
                                <p style={{ color: '#fff', fontWeight: 600 }}>Matching with Grandmaster...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <select 
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            background: 'rgba(155, 89, 182, 0.1)',
                            border: '1px solid rgba(155, 89, 182, 0.3)',
                            color: 'var(--accent-primary)',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <option value="Easy" style={{ background: '#1a1a1a' }}>Easy</option>
                        <option value="Medium" style={{ background: '#1a1a1a' }}>Medium</option>
                        <option value="Hard" style={{ background: '#1a1a1a' }}>Hard</option>
                    </select>

                    <button onClick={resetGame} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RotateCcw size={18} /> New Game
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </GameWrapper>
    );
};

export default Chess;
