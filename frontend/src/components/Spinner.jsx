export default function Spinner({ text = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{text}</p>
        </div>
    );
}
