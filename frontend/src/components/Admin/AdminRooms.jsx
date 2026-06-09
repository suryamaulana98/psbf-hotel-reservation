import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, BedDouble, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const AdminRooms = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState('');
    const [rooms, setRooms] = useState([]);
    
    // Form State
    const [roomType, setRoomType] = useState('');
    const [price, setPrice] = useState('');
    const [capacity, setCapacity] = useState('2');
    const [image, setImage] = useState(null);

    useEffect(() => {
        api.get('/hotels').then(res => setHotels(res.data));
    }, []);

    useEffect(() => {
        if (selectedHotel) {
            fetchRooms(selectedHotel);
        } else {
            setRooms([]);
        }
    }, [selectedHotel]);

    const fetchRooms = async (hotelId) => {
        try {
            const response = await api.get(`/rooms/hotel/${hotelId}`);
            setRooms(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHotel) return alert('Pilih hotel terlebih dahulu!');

        const formData = new FormData();
        formData.append('room_type', roomType);
        formData.append('price', price);
        formData.append('capacity', capacity);
        if (image) formData.append('image', image);

        try {
            await api.post(`/rooms/hotel/${selectedHotel}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Kamar berhasil ditambahkan!');
            setRoomType(''); setPrice(''); setCapacity('2'); setImage(null);
            fetchRooms(selectedHotel);
        } catch (error) {
            alert('Gagal menambahkan kamar');
        }
    };

    const handleDelete = async (roomId) => {
        if (window.confirm('Yakin ingin menghapus kamar ini?')) {
            try {
                await api.delete(`/rooms/${roomId}`);
                fetchRooms(selectedHotel);
            } catch (error) {
                alert('Gagal menghapus kamar');
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <label className="form-label" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Pilih Hotel untuk Dikelola Kamarnya</label>
                <div style={{ position: 'relative' }}>
                    <select className="form-control" value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)} style={{ padding: '1rem 1.25rem', fontSize: '1.1rem', cursor: 'pointer', appearance: 'none' }}>
                        <option value="">-- Silakan Pilih Hotel --</option>
                        {hotels.map(h => (
                            <option key={h.id} value={h.id}>{h.name} - {h.city}</option>
                        ))}
                    </select>
                    <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        ▼
                    </div>
                </div>
            </div>

            {selectedHotel ? (
                <>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BedDouble size={20} className="text-primary" /> Tambah Kamar Baru
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Tipe Kamar</label>
                                <input type="text" className="form-control" value={roomType} onChange={(e)=>setRoomType(e.target.value)} placeholder="Contoh: Deluxe Sea View" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Harga Per Malam (Rp)</label>
                                <input type="number" className="form-control" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Contoh: 1500000" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Kapasitas Maksimal (Orang)</label>
                                <input type="number" className="form-control" value={capacity} onChange={(e)=>setCapacity(e.target.value)} placeholder="2" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Foto Kamar</label>
                                <div style={{ border: '2px dashed var(--border)', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--bg-color)', display: 'flex', alignItems: 'center' }}>
                                    <input type="file" className="form-control" onChange={(e)=>setImage(e.target.files[0])} accept="image/*" style={{ border: 'none', background: 'transparent', padding: '0', boxShadow: 'none' }} />
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                                    <Plus size={18}/> Simpan Kamar
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem', overflow: 'hidden' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Daftar Kamar di Hotel Terpilih</h3>
                        <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tipe Kamar</th>
                                        <th>Harga / Malam</th>
                                        <th>Kapasitas</th>
                                        <th style={{ textAlign: 'right' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 600 }}>{r.room_type}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Rp {parseFloat(r.price).toLocaleString('id-ID')}</td>
                                            <td>{r.capacity} Dewasa</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button onClick={() => handleDelete(r.id)} className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444', borderColor: '#ef4444' }} title="Hapus Kamar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rooms.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Belum ada data kamar untuk hotel ini.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p style={{ fontSize: '1.1rem' }}>Silakan pilih hotel dari menu dropdown di atas untuk mulai mengelola kamarnya.</p>
                </div>
            )}
        </div>
    );
};

export default AdminRooms;
