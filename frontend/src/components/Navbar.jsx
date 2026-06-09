import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={`navbar ${scrolled ? 'glass shadow-sm' : ''}`} style={{ background: scrolled ? '' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: scrolled ? '' : '1px solid rgba(255,255,255,0.3)' }}>
            <div className="container nav-container">
                <Link to="/" className="nav-brand">
                    <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', color: 'white', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
                        <Building2 size={20} />
                    </div>
                    GrandNusa
                </Link>

                <div className="nav-links">
                    <Link to="/" className="nav-link">Beranda</Link>
                    
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LayoutDashboard size={18} /> Admin Panel
                                </Link>
                            )}
                            {user.role === 'user' && (
                                <Link to="/my-bookings" className="nav-link">Riwayat Pesanan</Link>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '1.5px solid var(--border)' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '0.4rem', borderRadius: '50%', border: '1px solid var(--border)' }}>
                                        <User size={16} color="var(--primary)" />
                                    </div>
                                    {user.name}
                                </span>
                                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/login" className="nav-link" style={{ fontWeight: 600 }}>Masuk</Link>
                            <Link to="/register" className="btn btn-primary">Daftar</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
