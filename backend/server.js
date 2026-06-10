const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
// Terkadang XAMPP memberikan process.env.PORT = 3306. Kita paksa ke 5000.
let PORT = process.env.PORT || 5000;
if (PORT == 3306) {
    PORT = 5000;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Karena di Vercel kita menggunakan Base64, folder static uploads tidak lagi relevan
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes import
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Route dasar
app.get('/', (req, res) => {
    res.send('API Sistem Reservasi Hotel Berjalan Lancar!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Ekspor app agar bisa berjalan sebagai Serverless Function di Vercel
module.exports = app;
