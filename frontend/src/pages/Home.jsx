import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Star, Search, ArrowRight, Building2 } from 'lucide-react';

const Home = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await api.get('/hotels');
                setHotels(response.data);
            } catch (error) {
                console.error('Error fetching hotels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    return (
        <div className="page-wrapper">
            <section className="hero">
                <div className="container animate-fade-in">
                    <div style={{ display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Pemesanan Hotel Terbaik
                    </div>
                    <h1>Temukan Penginapan Impian Anda</h1>
                    <p>Pesan hotel premium dengan harga terbaik di seluruh penjuru negeri. Nikmati pengalaman menginap tak terlupakan bersama layanan kelas dunia GrandNusa.</p>
                    
                    <div className="search-bar-glass">
                        <Search size={24} color="var(--text-muted)" style={{ marginLeft: '1rem' }} />
                        <input type="text" placeholder="Mau menginap di mana? (misal: Bali, Jakarta...)" className="form-control" />
                        <button className="btn btn-primary">
                            Cari
                        </button>
                    </div>
                </div>
            </section>

            <section className="container" style={{ padding: '6rem 1.5rem 4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Rekomendasi Populer</h2>
                        <p>Pilihan akomodasi terbaik yang paling sering dipesan minggu ini.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ fontWeight: 500 }}>Memuat data hotel terbaik...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div className="card-grid">
                        {hotels.length > 0 ? hotels.map(hotel => (
                            <Link to={`/hotel/${hotel.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={hotel.id}>
                                <div className="card">
                                    <div className="card-img-wrapper">
                                        <img 
                                            src={hotel.image_url ? `http://localhost:5000${hotel.image_url}` : 'https://images.unsplash.com/photo-1566073171639-4d8e8d536ff2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                                            alt={hotel.name} 
                                            className="card-img" 
                                        />
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', boxShadow: 'var(--shadow-md)' }}>
                                            <Star size={14} fill="#f59e0b" color="#f59e0b" /> 4.8
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-location">
                                            <MapPin size={16} className="text-primary" /> {hotel.city}
                                        </div>
                                        <h3 className="card-title">{hotel.name}</h3>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {hotel.description}
                                        </p>
                                        <div className="card-footer">
                                            <div className="price">Mulai dari<br/><span>Rp 500.000 / malam</span></div>
                                            <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }} className="arrow-btn">
                                                <ArrowRight size={20} color="var(--primary)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                                <Building2 size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Belum ada hotel yang terdaftar.</h3>
                                <p>Silakan minta administrator untuk menambahkan data hotel.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
            
            {/* Adding hover effect for arrow button in card via inline style block for simplicity */}
            <style dangerouslySetInnerHTML={{__html: `
                .card:hover .arrow-btn { background: var(--primary); }
                .card:hover .arrow-btn svg { stroke: white; }
            `}} />
        </div>
    );
};

export default Home;
