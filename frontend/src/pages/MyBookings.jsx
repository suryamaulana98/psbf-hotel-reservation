import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Receipt, Calendar, Hotel, CheckCircle2, Clock, XCircle } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const response = await api.get('/bookings/my-bookings');
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyBookings();
    }, []);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed': return { icon: <CheckCircle2 size={18} />, color: '#059669', bg: '#d1fae5', text: 'Selesai' };
            case 'confirmed': return { icon: <CheckCircle2 size={18} />, color: '#0284c7', bg: '#e0f2fe', text: 'Dikonfirmasi' };
            case 'cancelled': return { icon: <XCircle size={18} />, color: '#dc2626', bg: '#fee2e2', text: 'Dibatalkan' };
            default: return { icon: <Clock size={18} />, color: '#d97706', bg: '#fef3c7', text: 'Menunggu Konfirmasi' };
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '6rem 1.5rem 4rem', maxWidth: '800px' }}>
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Riwayat Pesanan</h1>
                    <p style={{ fontSize: '1.1rem' }}>Kelola dan pantau semua transaksi pemesanan hotel Anda di sini.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ fontWeight: 500 }}>Memuat riwayat...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {bookings.map(b => {
                            const status = getStatusConfig(b.status);
                            return (
                                <div key={b.id} className="card" style={{ padding: '0', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                                    <div style={{ width: '8px', background: status.color }}></div>
                                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                                                    <Hotel size={24} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{b.hotel_name}</h3>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                        <Receipt size={14} /> ID Pesanan: #{b.id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: status.bg, color: status.color, padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                {status.icon} {status.text}
                                            </div>
                                        </div>

                                        <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div>
                                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.25rem' }}>Tipe Kamar</p>
                                                        <p style={{ fontWeight: 600 }}>{b.room_type}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.25rem' }}>Tanggal Inap</p>
                                                        <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Calendar size={16} color="var(--text-muted)" />
                                                            {new Date(b.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(b.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.25rem' }}>Total Pembayaran</p>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                                    Rp {parseFloat(b.total_price).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {bookings.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                                <Receipt size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Belum ada pesanan</h3>
                                <p>Anda belum memiliki riwayat pemesanan hotel.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
