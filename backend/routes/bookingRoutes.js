const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus, getBookedDatesByRoom, getDashboardStats, getChartData, getFinancialReports } = require('../controllers/bookingController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Setup multer storage for payment proofs in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public Routes (or verifyToken for dates if you want, but it's safe to be public for checking availability)
router.get('/room/:roomId/dates', getBookedDatesByRoom);

// Route untuk User
router.post('/', verifyToken, upload.single('payment_proof'), createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);

// Route untuk Admin
router.get('/all', verifyToken, verifyAdmin, getAllBookings);
router.put('/:id/status', verifyToken, verifyAdmin, updateBookingStatus);
router.get('/stats', verifyToken, verifyAdmin, getDashboardStats);
router.get('/chart-data', verifyToken, verifyAdmin, getChartData);
router.get('/finance', verifyToken, verifyAdmin, getFinancialReports);

module.exports = router;
