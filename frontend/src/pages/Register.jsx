import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Building2 } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        const result = await register(name, email, password);
        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', color: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>
                        <Building2 size={32} />
                    </div>
                    <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Buat Akun Baru</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Mulai pengalaman menginap terbaik Anda</p>
                </div>
                
                {error && <div style={{ background: 'var(--danger-bg)', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, border: '1px solid #fca5a5' }}>{error}</div>}
                {success && <div style={{ background: 'var(--success-bg)', color: '#065f46', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, border: '1px solid #6ee7b7' }}>{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Contoh: John Doe"
                            required 
                        />
                    </div>

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
                            placeholder="Minimal 6 karakter"
                            required 
                            minLength="6"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }}>
                        <UserPlus size={20} /> Daftar Sekarang
                    </button>
                </form>
                
                <div style={{ marginTop: '2.5rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 1 }}></div>
                    <span style={{ background: 'white', padding: '0 1rem', position: 'relative', zIndex: 2, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sudah punya akun?</span>
                </div>
                
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
