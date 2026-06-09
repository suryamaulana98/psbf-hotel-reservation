const db = require('../config/db');

const getAllHotels = async (req, res) => {
    try {
        const [hotels] = await db.query('SELECT * FROM hotels ORDER BY created_at DESC');
        res.status(200).json(hotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data hotel' });
    }
};

const getHotelById = async (req, res) => {
    const { id } = req.params;
    try {
        const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
        if (hotel.length === 0) {
            return res.status(404).json({ message: 'Hotel tidak ditemukan' });
        }
        res.status(200).json(hotel[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data hotel' });
    }
};

const createHotel = async (req, res) => {
    const { name, description, address, city } = req.body;
    let image_url = null;

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    if (!name || !address || !city) {
        return res.status(400).json({ message: 'Nama, alamat, dan kota harus diisi!' });
    }

    try {
        await db.query(
            'INSERT INTO hotels (name, description, address, city, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, description, address, city, image_url]
        );
        res.status(201).json({ message: 'Hotel berhasil ditambahkan!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambahkan hotel' });
    }
};

const updateHotel = async (req, res) => {
    const { id } = req.params;
    const { name, description, address, city } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        await db.query(
            'UPDATE hotels SET name=?, description=?, address=?, city=?, image_url=? WHERE id=?',
            [name, description, address, city, image_url, id]
        );
        res.status(200).json({ message: 'Hotel berhasil diupdate!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengupdate hotel' });
    }
};

const deleteHotel = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM hotels WHERE id=?', [id]);
        res.status(200).json({ message: 'Hotel berhasil dihapus!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus hotel' });
    }
};

module.exports = { getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel };
