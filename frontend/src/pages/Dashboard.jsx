import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import AdminHotels from '../components/Admin/AdminHotels';
import AdminRooms from '../components/Admin/AdminRooms';
import { LayoutDashboard, ReceiptText, Building, BedDouble, CheckCircle2, XCircle, BarChart3, LineChart, Download, Users, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    
    // States for Bookings Tab
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalImage, setModalImage] = useState(null);

    // States for Overview Tab
    const [stats, setStats] = useState({ total_revenue: 0, total_bookings: 0, total_users: 0, total_hotels: 0 });
    const [chartData, setChartData] = useState([]);

    // States for Finance Tab
    const [financeData, setFinanceData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'overview') {
            fetchOverviewData();
        } else if (activeTab === 'finance') {
            fetchFinanceData();
        }
    }, [activeTab]);

    // Fetch Bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings/all');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Overview Stats & Chart
    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const [statsRes, chartRes] = await Promise.all([
                api.get('/bookings/stats'),
                api.get('/bookings/chart-data')
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data);
        } catch (error) {
            console.error('Error fetching overview data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Finance Data
    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            let url = '/bookings/finance';
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await api.get(url);
            setFinanceData(response.data);
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterFinance = (e) => {
        e.preventDefault();
        fetchFinanceData();
    };

    const exportToCSV = () => {
        if (financeData.length === 0) return alert('Tidak ada data untuk diekspor');

        // Setup CSV headers
        const headers = ['ID Pesanan', 'Nama Tamu', 'Hotel', 'Tipe Kamar', 'Check-in', 'Check-out', 'Total Pendapatan (Rp)', 'Status'];
        
        // Map data to CSV rows
        const rows = financeData.map(item => [
            `#${item.id}`,
            `"${item.user_name}"`, // Quote strings to handle commas in names
            `"${item.hotel_name}"`,
            `"${item.room_type}"`,
            new Date(item.check_in_date).toISOString().split('T')[0],
            new Date(item.check_out_date).toISOString().split('T')[0],
            item.total_price,
            item.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Create a blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `laporan_keuangan_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleStatusUpdate = async (id, status) => {
        if (status === 'rejected' && !window.confirm('Yakin ingin menolak pesanan ini?')) return;
        
        try {
            await api.put(`/bookings/${id}/status`, { status });
            fetchBookings(); 
        } catch (error) {
            alert('Gagal update status');
        }
    };

    if (user?.role !== 'admin') {
        return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Akses Ditolak</div>;
    }

    return (
        <div className="page-wrapper" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <LayoutDashboard size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Dashboard Admin</h1>
                        <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-muted)' }}>Kelola seluruh operasional hotel, analitik, dan reservasi tamu.</p>
                    </div>
                </div>

                <div className="dash-tabs" style={{ marginBottom: '2.5rem', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '0.5rem' }}>
                    <button 
                        className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('overview')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <BarChart3 size={18} /> Ringkasan
                    </button>
                    <button 
                        className={`dash-tab ${activeTab === 'bookings' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('bookings')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ReceiptText size={18} /> Pesanan Masuk
                    </button>
                    <button 
                        className={`dash-tab ${activeTab === 'finance' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('finance')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <LineChart size={18} /> Laporan Keuangan
                    </button>
                    <button 
                        className={`dash-tab ${activeTab === 'hotels' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hotels')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Building size={18} /> Kelola Hotel
                    </button>
                    <button 
                        className={`dash-tab ${activeTab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rooms')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <BedDouble size={18} /> Kelola Kamar
                    </button>
                </div>

                <div className="animate-fade-in">
                    
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            {loading ? (
                                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat analitik...</div>
                            ) : (
                                <>
                                    {/* Stat Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Total Pendapatan</p>
                                                    <h3 style={{ fontSize: '1.8rem', margin: 0, color: '#10b981' }}>Rp {(stats.total_revenue / 1000000).toFixed(1)}Jt</h3>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: '#d1fae5', color: '#10b981', borderRadius: '50%' }}>
                                                    <BarChart3 size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Total Pesanan</p>
                                                    <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.total_bookings}</h3>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%' }}>
                                                    <ReceiptText size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #f59e0b' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Total Pengguna</p>
                                                    <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.total_users}</h3>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: '#fef3c7', color: '#f59e0b', borderRadius: '50%' }}>
                                                    <Users size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #8b5cf6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Properti Hotel</p>
                                                    <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.total_hotels}</h3>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: '#ede9fe', color: '#8b5cf6', borderRadius: '50%' }}>
                                                    <Building size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts */}
                                    <div className="glass-card" style={{ padding: '2rem' }}>
                                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ margin: 0 }}>Grafik Pendapatan</h3>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Berdasarkan pesanan yang selesai/dikonfirmasi</p>
                                            </div>
                                        </div>
                                        <div style={{ height: '400px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `Rp${value/1000000}Jt`} />
                                                    <Tooltip 
                                                        formatter={(value) => [`Rp ${parseFloat(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    />
                                                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB: FINANCE */}
                    {activeTab === 'finance' && (
                        <div className="glass-card" style={{ padding: '2rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Laporan Keuangan</h3>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <form onSubmit={handleFilterFinance} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            style={{ padding: '0.5rem', height: '40px' }}
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span>-</span>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            style={{ padding: '0.5rem', height: '40px' }}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', height: '40px' }}>Filter</button>
                                    </form>
                                    
                                    <button onClick={exportToCSV} className="btn" style={{ padding: '0 1rem', height: '40px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white' }}>
                                        <Download size={18} /> Cetak Excel
                                    </button>
                                </div>
                            </div>
                            
                            {loading ? (
                                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat laporan...</div>
                            ) : (
                                <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Info Tamu & Hotel</th>
                                                <th>Check-in</th>
                                                <th>Check-out</th>
                                                <th style={{ textAlign: 'right' }}>Total (Rp)</th>
                                                <th style={{ textAlign: 'center' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {financeData.map((b) => (
                                                <tr key={b.id}>
                                                    <td style={{ fontWeight: 600 }}>#{b.id}</td>
                                                    <td>
                                                        <div style={{ fontWeight: 700 }}>{b.user_name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.hotel_name} - {b.room_type}</div>
                                                    </td>
                                                    <td>{new Date(b.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                    <td>{new Date(b.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                                                        {parseFloat(b.total_price).toLocaleString('id-ID')}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`badge badge-${b.status}`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {financeData.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                        Tidak ada data keuangan pada rentang tanggal ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {financeData.length > 0 && (
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, padding: '1rem' }}>Total Keseluruhan:</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '1.1rem', padding: '1rem' }}>
                                                        Rp {financeData.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toLocaleString('id-ID')}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: BOOKINGS (PESANAN MASUK) */}
                    {activeTab === 'bookings' && (
                        <div className="glass-card" style={{ padding: '2rem', overflow: 'hidden' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Daftar Reservasi Terbaru</h3>
                            
                            {loading ? (
                                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data reservasi...</div>
                            ) : (
                                <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Info Tamu</th>
                                                <th>Detail Kamar</th>
                                                <th>Tgl Menginap</th>
                                                <th>Total & Bukti</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'center' }}>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((b) => (
                                                <tr key={b.id}>
                                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{b.id}</td>
                                                    <td style={{ fontWeight: 600 }}>{b.user_name}</td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{b.hotel_name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.room_type}</div>
                                                    </td>
                                                    <td style={{ fontSize: '0.9rem' }}>
                                                        {new Date(b.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(b.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Rp {parseFloat(b.total_price).toLocaleString('id-ID')}</div>
                                                        {b.payment_proof ? (
                                                            <div 
                                                                onClick={() => setModalImage(b.payment_proof.startsWith('http') || b.payment_proof.startsWith('data:image') ? b.payment_proof : `http://localhost:5000${b.payment_proof}`)}
                                                                style={{ cursor: 'pointer', display: 'inline-block' }}
                                                                title="Klik untuk perbesar"
                                                            >
                                                                <img 
                                                                    src={b.payment_proof.startsWith('http') || b.payment_proof.startsWith('data:image') ? b.payment_proof : `http://localhost:5000${b.payment_proof}`} 
                                                                    alt="Bukti Transfer" 
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }} 
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada bukti</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${b.status}`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {b.status === 'pending' && (
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                                                                    className="btn btn-primary" 
                                                                    style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'inline-flex', gap: '0.25rem' }}
                                                                    title="Konfirmasi Pesanan"
                                                                >
                                                                    <CheckCircle2 size={16} /> Konfirmasi
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(b.id, 'rejected')}
                                                                    className="btn" 
                                                                    style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'inline-flex', gap: '0.25rem', backgroundColor: '#fee2e2', color: '#dc2626' }}
                                                                    title="Tolak Pesanan"
                                                                >
                                                                    <XCircle size={16} /> Tolak
                                                                </button>
                                                            </div>
                                                        )}
                                                        {b.status === 'confirmed' && (
                                                            <button 
                                                                onClick={() => handleStatusUpdate(b.id, 'completed')}
                                                                className="btn btn-outline" 
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: '#10b981', color: '#10b981', display: 'inline-flex', gap: '0.25rem' }}
                                                            >
                                                                Selesai
                                                            </button>
                                                        )}
                                                        {(b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled') && (
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {bookings.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                        Belum ada data reservasi masuk.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: HOTELS & ROOMS */}
                    {activeTab === 'hotels' && <AdminHotels />}
                    {activeTab === 'rooms' && <AdminRooms />}
                </div>
            </div>

            {/* IMAGE MODAL */}
            {modalImage && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setModalImage(null)}
                >
                    <button 
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000 }}
                        onClick={(e) => { e.stopPropagation(); setModalImage(null); }}
                    >
                        <X size={24} color="#000" />
                    </button>
                    <img 
                        src={modalImage} 
                        alt="Bukti Diperbesar" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
