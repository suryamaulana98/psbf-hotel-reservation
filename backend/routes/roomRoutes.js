const express = require('express');
const router = express.Router();
const { getRoomsByHotelId, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Public Routes
router.get('/hotel/:hotelId', getRoomsByHotelId);

// Admin Routes
router.post('/hotel/:hotelId', verifyToken, verifyAdmin, upload.single('image'), createRoom);
router.put('/:roomId', verifyToken, verifyAdmin, upload.single('image'), updateRoom);
router.delete('/:roomId', verifyToken, verifyAdmin, deleteRoom);

module.exports = router;
