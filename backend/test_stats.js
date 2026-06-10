const mysql = require('mysql2/promise');
async function test() {
    try {
        const db = await mysql.createConnection({host:'localhost', user:'root', database:'hotel_reservation_db'});
        const [[{ total_revenue }]] = await db.query('SELECT SUM(total_price) as total_revenue FROM bookings WHERE status IN ("completed", "confirmed")');
        console.log('success', total_revenue);
        db.end();
    } catch (e) {
        console.error('error:', e.message);
    }
}
test();
