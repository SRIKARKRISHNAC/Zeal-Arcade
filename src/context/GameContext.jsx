import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('zealUser'));
    const [balance, setBalance] = useState(parseInt(localStorage.getItem('zealux_balance')) || 0);

    useEffect(() => {
        if (user) {
            localStorage.setItem('zealUser', user);
        } else {
            localStorage.removeItem('zealUser');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('zealux_balance', balance);
    }, [balance]);

    const login = (username) => {
        setUser(username);
        if (!localStorage.getItem('zealux_balance')) {
            setBalance(1000); // Starter balance
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('zealUser');
    };

    const updateBalance = (amount) => {
        setBalance(prev => prev + amount);
    };

    return (
        <GameContext.Provider value={{ user, balance, login, logout, updateBalance }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
