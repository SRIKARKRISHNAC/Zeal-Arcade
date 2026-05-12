import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('zealUser'));
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (user) {
            localStorage.setItem('zealUser', user);
            const savedBalance = localStorage.getItem(`zealux_balance_${user}`);
            if (savedBalance !== null) {
                setBalance(parseInt(savedBalance));
            } else {
                setBalance(100); // Default for truly new user
                localStorage.setItem(`zealux_balance_${user}`, '100');
            }
        } else {
            localStorage.removeItem('zealUser');
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`zealux_balance_${user}`, balance);
        }
    }, [balance, user]);

    const login = (username) => {
        setUser(username);
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
