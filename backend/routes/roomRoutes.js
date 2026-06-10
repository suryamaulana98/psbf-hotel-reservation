const express = require('express');
const router = express.Router();
const { getRoomsByHotelId, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Setup multer storage to use memory (RAM) instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public Routes
router.get('/hotel/:hotelId', getRoomsByHotelId);

// Admin Routes
router.post('/hotel/:hotelId', verifyToken, verifyAdmin, upload.single('image'), createRoom);
router.put('/:roomId', verifyToken, verifyAdmin, upload.single('image'), updateRoom);
router.delete('/:roomId', verifyToken, verifyAdmin, deleteRoom);

module.exports = router;
