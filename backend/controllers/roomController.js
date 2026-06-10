const db = require('../config/db');
const { uploadToCloudinary } = require('../config/cloudinary');

const getRoomsByHotelId = async (req, res) => {
    const { hotelId } = req.params;
    try {
        const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ? ORDER BY created_at DESC', [hotelId]);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data kamar' });
    }
};

const createRoom = async (req, res) => {
    const { hotelId } = req.params;
    const { room_type, price, capacity, status } = req.body;
    let image_url = null;

    if (req.file) {
        try {
            image_url = await uploadToCloudinary(req.file.buffer, 'rooms');
        } catch (err) {
            console.error('Cloudinary upload error:', err);
            return res.status(500).json({ message: 'Gagal mengunggah gambar ke Cloudinary' });
        }
    }

    if (!room_type || !price) {
        return res.status(400).json({ message: 'Tipe kamar dan harga harus diisi!' });
    }

    try {
        await db.query(
            'INSERT INTO rooms (hotel_id, room_type, price, capacity, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
            [hotelId, room_type, price, capacity || 2, image_url, status || 'available']
        );
        res.status(201).json({ message: 'Kamar berhasil ditambahkan!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambahkan kamar' });
    }
};

const updateRoom = async (req, res) => {
    const { roomId } = req.params;
    const { room_type, price, capacity, status } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
        try {
            image_url = await uploadToCloudinary(req.file.buffer, 'rooms');
        } catch (err) {
            console.error('Cloudinary upload error:', err);
            return res.status(500).json({ message: 'Gagal mengunggah gambar ke Cloudinary' });
        }
    }

    try {
        await db.query(
            'UPDATE rooms SET room_type=?, price=?, capacity=?, status=?, image_url=? WHERE id=?',
            [room_type, price, capacity, status, image_url, roomId]
        );
        res.status(200).json({ message: 'Kamar berhasil diupdate!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengupdate kamar' });
    }
};

const deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        await db.query('DELETE FROM rooms WHERE id=?', [roomId]);
        res.status(200).json({ message: 'Kamar berhasil dihapus!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus kamar' });
    }
};

module.exports = { getRoomsByHotelId, createRoom, updateRoom, deleteRoom };
