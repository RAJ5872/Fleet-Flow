import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader } from 'lucide-react';

// Popular Indian logistics hubs shown as quick suggestions when input is short
const QUICK_HUBS = [
    'Mumbai JNPT Port', 'Delhi ICD Patparganj', 'Pune Bhosari MIDC',
    'Chennai Port', 'Hyderabad Katedan ICD', 'Kolkata Haldia Port',
    'Ahmedabad Khodiyar', 'Bangalore Whitefield', 'Surat Sachin GIDC',
    'Nagpur Butibori MIDC', 'Bhiwandi Logistics Park', 'Ludhiana ICD',
    'Jaipur Sitapura', 'Indore Pithampur', 'Coimbatore Singanallur',
];

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function PlaceInput({ value, onChange, placeholder, required }) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const wrapperRef = useRef(null);
    const debouncedQuery = useDebounce(query, 360);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch from Nominatim
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 3) {
            setResults([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetch(
            `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
                q: debouncedQuery + ' India',
                format: 'json',
                addressdetails: 1,
                limit: 7,
                countrycodes: 'in',
            }),
            { headers: { 'Accept-Language': 'en' } }
        )
            .then(r => r.json())
            .then(data => {
                if (cancelled) return;
                setResults(data.map(d => ({
                    label: d.display_name
                        .split(',')
                        .slice(0, 3)
                        .join(', ')
                        .trim(),
                    full: d.display_name,
                })));
                setLoading(false);
                setOpen(true);
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    const handleSelect = (label) => {
        setQuery(label);
        onChange(label);
        setOpen(false);
        setResults([]);
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        if (val.length >= 2) setOpen(true);
        else setOpen(false);
    };

    // Quick hubs filtered by current query
    const quickFiltered = query.length >= 1 && query.length < 3
        ? QUICK_HUBS.filter(h => h.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : [];

    const showDropdown = open && (results.length > 0 || loading || quickFiltered.length > 0);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            {/* Input */}
            <div style={{
                position: 'relative',
                border: `1px solid ${focused ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: '8px',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: focused ? '0 0 0 3px rgba(79,142,247,0.15)' : 'none',
                background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center',
            }}>
                <MapPin size={14} style={{
                    position: 'absolute', left: '11px', flexShrink: 0,
                    color: focused ? 'var(--blue)' : 'var(--text-muted)',
                    transition: 'color 0.15s',
                    pointerEvents: 'none',
                }} />
                <input
                    required={required}
                    value={query}
                    onChange={handleChange}
                    onFocus={() => { setFocused(true); if (query.length >= 2) setOpen(true); }}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder || 'Search location in India...'}
                    autoComplete="off"
                    style={{
                        width: '100%', padding: '9px 32px 9px 32px',
                        background: 'transparent', border: 'none', outline: 'none',
                        color: 'var(--text-primary)', fontSize: '0.88rem',
                        fontFamily: 'inherit',
                    }}
                />
                {loading && (
                    <Loader size={13} style={{
                        position: 'absolute', right: '10px',
                        color: 'var(--text-muted)', animation: 'spin 1s linear infinite',
                        flexShrink: 0,
                    }} />
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,142,247,0.08)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    animation: 'slideDown 0.12s ease',
                }}>
                    <style>{`
            @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
            @keyframes spin { to { transform:rotate(360deg); } }
            .place-item:hover { background: rgba(79,142,247,0.1) !important; }
          `}</style>

                    {/* Quick hubs section */}
                    {quickFiltered.length > 0 && (
                        <>
                            <div style={{
                                padding: '6px 12px 2px', fontSize: '0.65rem', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em'
                            }}>
                                Popular Hubs
                            </div>
                            {quickFiltered.map(h => (
                                <button key={h} className="place-item" onMouseDown={() => handleSelect(h)} style={{
                                    display: 'flex', alignItems: 'center', gap: '9px',
                                    width: '100%', padding: '9px 12px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.12s',
                                }}>
                                    <MapPin size={13} color="var(--blue)" />
                                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{h}</span>
                                </button>
                            ))}
                            {results.length > 0 && <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }} />}
                        </>
                    )}

                    {/* Nominatim results */}
                    {loading && results.length === 0 && (
                        <div style={{
                            padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Searching...
                        </div>
                    )}

                    {results.length > 0 && (
                        <>
                            <div style={{
                                padding: '6px 12px 2px', fontSize: '0.65rem', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em'
                            }}>
                                Search Results
                            </div>
                            {results.map((r, i) => (
                                <button key={i} className="place-item" onMouseDown={() => handleSelect(r.label)} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '9px',
                                    width: '100%', padding: '9px 12px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.12s',
                                }}>
                                    <MapPin size={13} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.label}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {!loading && results.length === 0 && quickFiltered.length === 0 && (
                        <div style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            No results — try a city or area name
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
