const mysql = require('mysql2/promise');
async function test() {
    try {
        const db = await mysql.createConnection({host:'localhost', user:'root', database:'hotel_reservation_db'});
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
        console.log('success', chartData);
        db.end();
    } catch (e) {
        console.error('error:', e.message);
    }
}
test();
