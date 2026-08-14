import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);
        timersRef.current[id] = setTimeout(() => removeToast(id), duration);
        return id;
    }, [removeToast]);

    const toast = useCallback({
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur || 5000),
        info: (msg, dur) => addToast(msg, 'info', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur),
    }, [addToast]);

    // Fix: useCallback can't return an object directly, use useMemo pattern
    return (
        <ToastContext.Provider value={{ success: (msg, dur) => addToast(msg, 'success', dur), error: (msg, dur) => addToast(msg, 'error', dur || 5000), info: (msg, dur) => addToast(msg, 'info', dur), warning: (msg, dur) => addToast(msg, 'warning', dur) }}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : 'toast-enter'}`}
                        onClick={() => removeToast(t.id)}
                        role="alert"
                    >
                        <span className="toast-icon">
                            {t.type === 'success' && '✓'}
                            {t.type === 'error' && '✕'}
                            {t.type === 'info' && 'ℹ'}
                            {t.type === 'warning' && '⚠'}
                        </span>
                        <span className="toast-message">{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
