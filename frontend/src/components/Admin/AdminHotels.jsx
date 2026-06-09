import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Building, Image as ImageIcon } from 'lucide-react';

const AdminHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const response = await api.get('/hotels');
            setHotels(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('address', address);
        formData.append('city', city);
        if (image) formData.append('image', image);

        try {
            await api.post('/hotels', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Hotel berhasil ditambahkan!');
            // Reset form
            setName(''); setDescription(''); setAddress(''); setCity(''); setImage(null);
            fetchHotels();
        } catch (error) {
            alert('Gagal menambahkan hotel');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus hotel ini?')) {
            try {
                await api.delete(`/hotels/${id}`);
                fetchHotels();
            } catch (error) {
                alert('Gagal menghapus hotel');
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={20} className="text-primary" /> Tambah Hotel Baru
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nama Hotel</label>
                        <input type="text" className="form-control" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Contoh: GrandNusa Bali" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Kota</label>
                        <input type="text" className="form-control" value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Contoh: Denpasar" required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label className="form-label">Alamat Lengkap</label>
                        <input type="text" className="form-control" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Jl. Raya Pantai Kuta No. 1..." required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label className="form-label">Deskripsi Hotel</label>
                        <textarea className="form-control" rows="4" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Jelaskan fasilitas dan keunggulan hotel..." required></textarea>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label className="form-label">Foto Utama Hotel</label>
                        <div style={{ border: '2px dashed var(--border)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center', background: 'var(--bg-color)', transition: 'var(--transition)' }}>
                            <ImageIcon size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                            <input type="file" className="form-control" onChange={(e)=>setImage(e.target.files[0])} accept="image/*" style={{ border: 'none', background: 'transparent', padding: '0', boxShadow: 'none' }} />
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            <Plus size={18}/> Simpan Hotel
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-card" style={{ padding: '2rem', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Daftar Hotel Terdaftar</h3>
                <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama Hotel</th>
                                <th>Kota</th>
                                <th style={{ textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map(h => (
                                <tr key={h.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{h.id}</td>
                                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                                    <td>{h.city}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(h.id)} className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444', borderColor: '#ef4444' }} title="Hapus Hotel">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {hotels.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Belum ada data hotel.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminHotels;
