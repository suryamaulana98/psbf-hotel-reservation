const express = require('express');
const router = express.Router();
const { getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Setup multer storage to use memory (RAM) instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public Routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Admin Routes
router.post('/', verifyToken, verifyAdmin, upload.single('image'), createHotel);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateHotel);
router.delete('/:id', verifyToken, verifyAdmin, deleteHotel);

module.exports = router;
