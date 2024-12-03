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

const previousDay = new Date();
previousDay.setDate(previousDay.getDate() - 1); // Получаем дату прошлого дня
console.log(previousDay.toDateString());

// Функция для формирования объекта
const formatUserFiles = (users, files) => {
    const usersMap = {};

    // Фильтруем пользователей с ролью 3
    const filteredUsers = users.filter(user => user.role === 3);

    filteredUsers.forEach(user => {
        usersMap[user.name] = {
            user_info: user,
            user_files: []
        };
    });

    files.forEach(file => {
        const fileDate = new Date(file.uploaded_to_telegram_at);
        console.log(fileDate.toDateString() === previousDay.toDateString());
        console.log(file.user_id);

        if (fileDate.toDateString() === previousDay.toDateString()) {
            usersMap[file.user_id].user_files.push({
                type: file.media_type === 1 ? 'Видео' : 'Фото',
                tg_id: file.tg_file_id
            });
        }
    });

    return usersMap;
};

// Выборка всех пользователей из базы данных
pool.query('SELECT * FROM users', (err, usersRes) => {
    if (err) {
        console.error('Ошибка при выполнении запроса пользователей:', err);
    } else {
        // Сохраняем результат выборки пользователей
        const users = usersRes.rows;

        // Выборка всех файлов из базы данных
        pool.query('SELECT * FROM files', (err, filesRes) => {
            if (err) {
                console.error('Ошибка при выполнении запроса файлов:', err);
            } else {
                // Сохраняем результат выборки файлов
                const files = filesRes.rows;

                // Формируем объект с нужной структурой
                const formattedData = formatUserFiles(users, files);
                console.log(formattedData);
            }
        });
    }
});

pool.query('SELECT * FROM users', (err, res) => {
    if (err) {
        console.error('Ошибка при выполнении запроса:', err);
    } else {
        console.table(res.rows);
    }
});
