import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({
    user: 'car_shot_admin',
    host: 'localhost', // Здесь указывается IP-адрес виртуального сервера
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
// pool.query('SELECT * FROM file_links', (err, res) => {
//     if (err) {
//         console.error('Ошибка при выполнении запроса:', err);
//     } else {
//         console.table(res.rows);
//     }
// });

// Запрос для получения имени текущей базы данных
const getDatabaseNameQuery = `
    SELECT current_database() AS database_name;
`;

// Выполнение запроса для получения имени базы данных
pool.query(getDatabaseNameQuery, (err, res) => {
    if (err) {
        console.error('Ошибка при получении имени базы данных:', err);
    } else {
        const databaseName = res.rows[0].database_name;
        console.log('Имя текущей базы данных:', databaseName);
    }
});