import { Pool } from 'pg';

const pool = new Pool({
    user: 'car_shot_admin',
    host: '31.129.109.210', // Здесь указывается IP-адрес виртуального сервера
    database: 'car_shot',
    password: 'IQuiNcEUPoCe',
    port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database. Current time in the database:', res.rows[0].now);
    }
});