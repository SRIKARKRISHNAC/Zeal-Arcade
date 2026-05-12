import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Arcade from './pages/Arcade';
import Snake from './pages/games/Snake';
import TicTacToe from './pages/games/TicTacToe';
import Sudoku from './pages/games/Sudoku';
import ConnectFour from './pages/games/ConnectFour';
import SnakeLadder from './pages/games/SnakeLadder';
import Ludo from './pages/games/Ludo';
import FlappyBird from './pages/games/FlappyBird';
import Arrows from './pages/games/Arrows';
import Pacman from './pages/games/Pacman';
import Rewards from './pages/Rewards';

const ProtectedRoute = ({ children }) => {
    const { user } = useGame();
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/arcade" element={
                        <ProtectedRoute>
                            <Arcade />
                        </ProtectedRoute>
                    } />
                    <Route path="/rewards" element={
                        <ProtectedRoute>
                            <Rewards />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/snake" element={
                        <ProtectedRoute>
                            <Snake />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/tic-tac-toe" element={
                        <ProtectedRoute>
                            <TicTacToe />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/sudoku" element={
                        <ProtectedRoute>
                            <Sudoku />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/connect-four" element={
                        <ProtectedRoute>
                            <ConnectFour />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/snake-ladder" element={
                        <ProtectedRoute>
                            <SnakeLadder />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/ludo" element={
                        <ProtectedRoute>
                            <Ludo />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/flappy-bird" element={
                        <ProtectedRoute>
                            <FlappyBird />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/arrows" element={
                        <ProtectedRoute>
                            <Arrows />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/pacman" element={
                        <ProtectedRoute>
                            <Pacman />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
