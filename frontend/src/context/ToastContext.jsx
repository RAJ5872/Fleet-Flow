import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const icons = { success: CheckCircle, error: XCircle, info: Info };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => {
                    const Icon = icons[t.type] || Info;
                    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
                    return (
                        <div key={t.id} className={`toast ${t.type}`}>
                            <Icon size={16} color={colors[t.type]} />
                            <span style={{ color: 'var(--text-primary)', flex: 1, fontSize: '0.88rem' }}>{t.message}</span>
                            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
