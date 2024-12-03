import pkg from 'pg';
import { constants } from '../../constants.js';

const {
    POSTGRES_DATABASE,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
} = constants;

const { Pool } = pkg;
const pool = new Pool({
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DATABASE,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database. Current time in the database:', res.rows[0].now);
    }
});

// Запрос для получения списка всех таблиц в базе данных
const getTablesQuery = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
`;

// Выполнение запроса для получения списка всех таблиц
pool.query(getTablesQuery, (err, res) => {
    if (err) {
        console.error('Ошибка при получении списка таблиц:', err);
    } else {
        const tables = res.rows.map(row => row.table_name);
        console.log('Имена таблиц в базе данных:', tables);
    }
});

// Выборка всех данных из таблицы "your_table_name"
pool.query('SELECT * FROM files', (err, res) => {
    if (err) {
        console.error('Ошибка при выполнении запроса:', err);
    } else {
        console.log(res.rows);
    }
});

// Выборка всех данных из таблицы "your_table_name"
pool.query('SELECT * FROM users', (err, res) => {
    if (err) {
        console.error('Ошибка при выполнении запроса:', err);
    } else {
        console.table(res.rows);
    }
});