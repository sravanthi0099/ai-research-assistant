import { useState, useEffect } from 'react';

/**
 * Custom hook that syncs state with localStorage.
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if key doesn't exist
 */
export default function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('Failed to save to localStorage:', err);
        }
    }, [key, value]);

    return [value, setValue];
}
