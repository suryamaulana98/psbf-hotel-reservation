const db = require('../config/db');

// Mengambil tanggal yang sudah di-booking pada suatu kamar
const getBookedDatesByRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        // Ambil semua booking yang berstatus pending, confirmed, atau completed
        // Status cancelled dan rejected tidak dihitung karena kamarnya kosong
        const query = `
            SELECT check_in_date, check_out_date 
            FROM bookings 
            WHERE room_id = ? AND status NOT IN ('cancelled', 'rejected')
        `;
        const [bookings] = await db.query(query, [roomId]);
        
        // Kita hanya mengembalikan daftar tanggal check-in dan check-out
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data tanggal booking' });
    }
};

// Guest/User membuat booking
const createBooking = async (req, res) => {
    const { room_id, check_in_date, check_out_date } = req.body;
    const user_id = req.user.id;
    let payment_proof = null;

    if (req.file) {
        payment_proof = `/uploads/${req.file.filename}`;
    }

    if (!room_id || !check_in_date || !check_out_date || !payment_proof) {
        return res.status(400).json({ message: 'Lengkapi data booking dan sertakan bukti pembayaran!' });
    }

    try {
        // Cek harga kamar
        const [room] = await db.query('SELECT price FROM rooms WHERE id = ?', [room_id]);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        }

        // Cek kembali ketersediaan kamar pada tanggal yang diinput di sisi server untuk keamanan ganda
        const overlapQuery = `
            SELECT id FROM bookings 
            WHERE room_id = ? 
            AND status NOT IN ('cancelled', 'rejected')
            AND (
                (check_in_date < ? AND check_out_date > ?)
            )
        `;
        // Logika overlap: Booking yang ada overlap dengan request jika
        // Ada booking yang check-in nya lebih kecil dari check-out request
        // DAN check-out nya lebih besar dari check-in request.
        const [overlapping] = await db.query(
            `SELECT id FROM bookings 
             WHERE room_id = ? 
             AND status NOT IN ('cancelled', 'rejected')
             AND check_in_date < ? 
             AND check_out_date > ?`,
            [room_id, check_out_date, check_in_date]
        );

        if (overlapping.length > 0) {
            return res.status(400).json({ message: 'Kamar sudah dipesan pada tanggal tersebut. Silakan pilih tanggal lain.' });
        }

        const pricePerNight = room[0].price;
        
        // Hitung total harga (asumsi sederhana: selisih hari)
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const total_price = diffDays * pricePerNight;

        // Simpan ke database beserta payment_proof
        const [result] = await db.query(
            'INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, payment_proof, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, room_id, check_in_date, check_out_date, total_price, payment_proof, 'pending']
        );

        res.status(201).json({ 
            message: 'Booking berhasil dibuat dan pembayaran sedang diverifikasi!', 
            booking_id: result.insertId,
            total_price 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat booking' });
    }
};

// Melihat histori booking milik user sendiri
const getMyBookings = async (req, res) => {
    const user_id = req.user.id;
    try {
        const query = `
            SELECT b.*, r.room_type, h.name as hotel_name 
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN hotels h ON r.hotel_id = h.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.query(query, [user_id]);
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data histori booking' });
    }
};

// Admin melihat semua booking
const getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.name as user_name, r.room_type, h.name as hotel_name 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
            JOIN hotels h ON r.hotel_id = h.id
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.query(query);
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil semua data booking' });
    }
};

// Admin update status booking
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query('UPDATE bookings SET status=? WHERE id=?', [status, id]);
        res.status(200).json({ message: `Status booking berhasil diupdate menjadi ${status}!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengupdate status booking' });
    }
};

// Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const [[{ total_revenue }]] = await db.query('SELECT SUM(total_price) as total_revenue FROM bookings WHERE status IN ("completed", "confirmed")');
        const [[{ total_bookings }]] = await db.query('SELECT COUNT(id) as total_bookings FROM bookings');
        const [[{ total_users }]] = await db.query('SELECT COUNT(id) as total_users FROM users WHERE role="user"');
        const [[{ total_hotels }]] = await db.query('SELECT COUNT(id) as total_hotels FROM hotels');

        res.status(200).json({
            total_revenue: total_revenue || 0,
            total_bookings: total_bookings || 0,
            total_users: total_users || 0,
            total_hotels: total_hotels || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil statistik dashboard' });
    }
};

// Admin Chart Data (Last 6 months)
const getChartData = async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(check_in_date, '%b') as name, 
                SUM(total_price) as revenue, 
                COUNT(id) as sales
            FROM bookings 
            WHERE status IN ('completed', 'confirmed') 
            AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
            GROUP BY MONTH(check_in_date), name
            ORDER BY MONTH(check_in_date) ASC
        `;
        const [chartData] = await db.query(query);
        res.status(200).json(chartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data chart' });
    }
};

// Admin Financial Reports
const getFinancialReports = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        let query = `
            SELECT b.id, b.check_in_date, b.check_out_date, b.total_price, b.status, u.name as user_name, r.room_type, h.name as hotel_name 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
            JOIN hotels h ON r.hotel_id = h.id
            WHERE b.status IN ('completed', 'confirmed')
        `;
        const queryParams = [];

        if (startDate && endDate) {
            query += ` AND b.check_in_date BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        }

        query += ` ORDER BY b.check_in_date DESC`;

        const [reports] = await db.query(query, queryParams);
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil laporan keuangan' });
    }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus, getBookedDatesByRoom, getDashboardStats, getChartData, getFinancialReports };
