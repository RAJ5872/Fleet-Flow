import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer, size = '' }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
                <div className="modal-header">
                    <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
