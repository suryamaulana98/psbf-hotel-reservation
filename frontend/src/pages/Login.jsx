import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Building2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', color: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>
                        <Building2 size={32} />
                    </div>
                    <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Selamat Datang Kembali</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Silakan masuk ke akun GrandNusa Anda</p>
                </div>
                
                {error && <div style={{ background: 'var(--danger-bg)', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fca5a5' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Alamat Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="nama@email.com"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Kata Sandi</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
                        <LogIn size={20} /> Masuk Sekarang
                    </button>
                </form>
                
                <div style={{ marginTop: '2.5rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 1 }}></div>
                    <span style={{ background: 'white', padding: '0 1rem', position: 'relative', zIndex: 2, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Belum punya akun?</span>
                </div>
                
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem' }}>
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Daftar akun baru di sini</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
