import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Users, CheckCircle, BedDouble, Upload, AlertCircle } from 'lucide-react';

const HotelDetail = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Form Booking State
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    
    // Validation State
    const [bookedDates, setBookedDates] = useState([]);
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const hotelRes = await api.get(`/hotels/${id}`);
                setHotel(hotelRes.data);
                
                const roomsRes = await api.get(`/rooms/hotel/${id}`);
                setRooms(roomsRes.data);
            } catch (error) {
                console.error('Error fetching hotel details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotelData();
    }, [id]);

    useEffect(() => {
        if (selectedRoom) {
            // Ambil daftar tanggal yang sudah dibooking untuk kamar ini
            api.get(`/bookings/room/${selectedRoom.id}/dates`)
                .then(res => setBookedDates(res.data))
                .catch(err => console.error("Gagal mengambil data ketersediaan kamar:", err));
        } else {
            setBookedDates([]);
        }
    }, [selectedRoom]);

    // Fungsi validasi persinggungan tanggal (Overlap)
    const validateDates = (inDate, outDate) => {
        if (!inDate || !outDate || !selectedRoom) {
            setDateError('');
            return true;
        }

        const reqIn = new Date(inDate);
        const reqOut = new Date(outDate);

        if (reqOut <= reqIn) {
            setDateError('Tanggal Check-out harus setelah Check-in.');
            return false;
        }

        // Cek overlap dengan bookedDates
        for (let booking of bookedDates) {
            const bookIn = new Date(booking.check_in_date);
            const bookOut = new Date(booking.check_out_date);

            // Kondisi Overlap: Check-in request lebih awal dari Check-out booking DAN Check-out request lebih lambat dari Check-in booking
            if (reqIn < bookOut && reqOut > bookIn) {
                setDateError('Kamar sudah dipesan pada rentang tanggal ini. Silakan pilih tanggal lain.');
                return false;
            }
        }

        setDateError('');
        return true;
    };

    // Handler perubahan tanggal
    const handleCheckInChange = (e) => {
        const val = e.target.value;
        setCheckIn(val);
        validateDates(val, checkOut);
    };

    const handleCheckOutChange = (e) => {
        const val = e.target.value;
        setCheckOut(val);
        validateDates(checkIn, val);
    };

    // Handler ganti kamar (harus validasi ulang jika tanggal sudah terisi)
    const handleRoomSelection = (room) => {
        setSelectedRoom(room);
    };

    useEffect(() => {
        // Validasi ulang saat daftar bookedDates berubah (setelah ganti kamar)
        if (checkIn && checkOut) {
            validateDates(checkIn, checkOut);
        }
    }, [bookedDates]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Silakan login terlebih dahulu untuk memesan kamar.');
            navigate('/login');
            return;
        }
        if (!selectedRoom || !checkIn || !checkOut || !paymentProof) {
            alert('Harap lengkapi tanggal, pilih kamar, dan unggah bukti pembayaran!');
            return;
        }

        if (!validateDates(checkIn, checkOut)) {
            alert('Terdapat kesalahan pada tanggal yang Anda pilih.');
            return;
        }

        const formData = new FormData();
        formData.append('room_id', selectedRoom.id);
        formData.append('check_in_date', checkIn);
        formData.append('check_out_date', checkOut);
        formData.append('payment_proof', paymentProof);

        try {
            await api.post('/bookings', formData);
            setBookingSuccess(true);
            setTimeout(() => navigate('/my-bookings'), 2000);
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal melakukan pemesanan.');
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '8rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minHeight: '100vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontWeight: 500 }}>Memuat informasi hotel...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    
    if (!hotel) return <div style={{ textAlign: 'center', padding: '8rem', minHeight: '100vh' }}>Hotel tidak ditemukan.</div>;

    // Hitung total harga jika input lengkap
    let totalPriceDisplay = 0;
    if (selectedRoom && checkIn && checkOut && !dateError) {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        if (outDate > inDate) {
            const diffDays = Math.ceil(Math.abs(outDate - inDate) / (1000 * 60 * 60 * 24));
            totalPriceDisplay = diffDays * selectedRoom.price;
        }
    }

    return (
        <div className="page-wrapper" style={{ paddingBottom: '4rem' }}>
            {/* Header Hotel */}
            <div style={{ height: '500px', width: '100%', position: 'relative', marginTop: '-5rem' }}>
                <img 
                    src={hotel.image_url ? (hotel.image_url.startsWith('data:image') ? hotel.image_url : `http://localhost:5000${hotel.image_url}`) : 'https://images.unsplash.com/photo-1566073171639-4d8e8d536ff2?auto=format&fit=crop&w=1920&q=80'} 
                    alt={hotel.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)', display: 'flex', alignItems: 'flex-end', paddingBottom: '3rem' }}>
                    <div className="container" style={{ width: '100%' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'white', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            <MapPin size={16} /> {hotel.address}, {hotel.city}
                        </div>
                        <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '3.5rem' }}>{hotel.name}</h1>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '3rem', alignItems: 'start' }}>
                {/* Deskripsi & Daftar Kamar */}
                <div>
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Tentang Hotel Ini</h2>
                        <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>{hotel.description}</p>
                    </section>

                    <section>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Pilihan Kamar
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {rooms.map(room => (
                                <div 
                                    key={room.id} 
                                    className={`card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'row', 
                                        padding: '1rem', 
                                        gap: '1.5rem', 
                                        borderColor: selectedRoom?.id === room.id ? 'var(--primary)' : 'var(--border)',
                                        borderWidth: selectedRoom?.id === room.id ? '2px' : '1px',
                                        boxShadow: selectedRoom?.id === room.id ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : 'var(--shadow-sm)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleRoomSelection(room)}
                                >
                                    <div style={{ width: '200px', height: '160px', flexShrink: 0, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                                        <img 
                                            src={room.image_url ? (room.image_url.startsWith('data:image') ? room.image_url : `http://localhost:5000${room.image_url}`) : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80'} 
                                            alt={room.room_type}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{room.room_type}</h3>
                                            {selectedRoom?.id === room.id && (
                                                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>DIPILIH</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18}/> Maks. {room.capacity} Org</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BedDouble size={18}/> 1 Kasur Double</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="price" style={{ fontSize: '1.5rem' }}>Rp {parseFloat(room.price).toLocaleString('id-ID')} <span>/ malam</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {rooms.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                                    <p>Tidak ada kamar yang tersedia saat ini.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Form Reservasi (Sidebar) */}
                <div style={{ position: 'sticky', top: '7rem' }}>
                    <div className="glass-card" style={{ padding: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Detail Pemesanan</h3>
                        
                        {bookingSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <CheckCircle size={40} color="var(--success)" />
                                </div>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Pesanan Berhasil!</h4>
                                <p style={{ color: 'var(--text-muted)' }}>Anda akan dialihkan ke Riwayat Pesanan...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Check-in</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={checkIn}
                                            onChange={handleCheckInChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Check-out</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={checkOut}
                                            onChange={handleCheckOutChange}
                                            min={checkIn || new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>

                                {dateError && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                                        <AlertCircle size={16} /> {dateError}
                                    </div>
                                )}
                                {!dateError && <div style={{ marginBottom: '1.5rem' }}></div>}

                                <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kamar Terpilih</p>
                                    {selectedRoom ? (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{selectedRoom.room_type}</p>
                                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Rp {parseFloat(selectedRoom.price).toLocaleString('id-ID')}</p>
                                            </div>
                                            {totalPriceDisplay > 0 && (
                                                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Pembayaran:</span>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Rp {totalPriceDisplay.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)' }}>Pilih kamar dari daftar di samping.</p>
                                    )}
                                </div>

                                {/* Bagian Pembayaran QRIS */}
                                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Pembayaran via QRIS</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Satu-satunya metode pembayaran yang didukung saat ini adalah melalui scan QRIS. Silakan scan kode di bawah ini, lalu unggah bukti transfer.</p>
                                    
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <img src="/qris.png" alt="QRIS Code" style={{ width: '100%', maxWidth: '200px', borderRadius: '12px', border: '1px solid var(--border)', padding: '0.5rem', background: 'white' }} />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={16}/> Unggah Bukti Pembayaran</label>
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            accept="image/*"
                                            onChange={(e) => setPaymentProof(e.target.files[0])}
                                            required
                                            style={{ padding: '0.5rem' }}
                                        />
                                        <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Format: JPG, PNG, JPEG</small>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: (!selectedRoom || dateError) ? 0.6 : 1 }}
                                    disabled={!selectedRoom || !!dateError}
                                >
                                    Pesan Sekarang
                                </button>
                                {!user && (
                                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Anda harus login untuk membuat pesanan.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .card.selected { transform: scale(1.02); }
                .card.selected:hover { transform: scale(1.02); }
            `}} />
        </div>
    );
};

export default HotelDetail;
