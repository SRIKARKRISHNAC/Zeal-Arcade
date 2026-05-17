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
import SeaBattle from './pages/games/SeaBattle';
import PingPong from './pages/games/PingPong';
import HandSlap from './pages/games/HandSlap';
import RPS from './pages/games/RSP';
import AirHockey from './pages/games/AirHocky';
import Chess from './pages/games/Chess';
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
                    <Route path="/games/sea-battle" element={
                        <ProtectedRoute>
                            <SeaBattle />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/ping-pong" element={
                        <ProtectedRoute>
                            <PingPong />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/hand-slap" element={
                        <ProtectedRoute>
                            <HandSlap />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/rps" element={
                        <ProtectedRoute>
                            <RPS />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/air-hockey" element={
                        <ProtectedRoute>
                            <AirHockey />
                        </ProtectedRoute>
                    } />
                    <Route path="/games/chess" element={
                        <ProtectedRoute>
                            <Chess />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;