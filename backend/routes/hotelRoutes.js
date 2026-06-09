const express = require('express');
const router = express.Router();
const { getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
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
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Admin Routes
router.post('/', verifyToken, verifyAdmin, upload.single('image'), createHotel);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateHotel);
router.delete('/:id', verifyToken, verifyAdmin, deleteHotel);

module.exports = router;
