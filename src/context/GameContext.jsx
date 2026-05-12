import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('zealUser'));
    const [balance, setBalance] = useState(() => {
        const initialUser = localStorage.getItem('zealUser');
        if (initialUser) {
            const saved = localStorage.getItem(`zealux_balance_${initialUser}`);
            return saved !== null ? parseInt(saved) : 100;
        }
        return 0;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('zealUser', user);
            const saved = localStorage.getItem(`zealux_balance_${user}`);
            if (saved === null) {
                setBalance(100);
                localStorage.setItem(`zealux_balance_${user}`, '100');
            } else {
                setBalance(parseInt(saved));
            }
        } else {
            localStorage.removeItem('zealUser');
        }
    }, [user]);

    const login = (username) => {
        setUser(username);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('zealUser');
    };

    const updateBalance = (amount) => {
        setBalance(prev => {
            const newBalance = prev + amount;
            if (user) {
                localStorage.setItem(`zealux_balance_${user}`, newBalance);
            }
            return newBalance;
        });
    };

    return (
        <GameContext.Provider value={{ user, balance, login, logout, updateBalance }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
