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
previousDay.setDate(previousDay.getDate() - 1);

const formatUserFiles = (users, files) => {
    const usersMap = {};
    const filteredUsers = users.filter(({ role }) => role === 3);

    filteredUsers.forEach(({ name, user_id, tg_id, tg_username }) => {
        usersMap[user_id] = {
            user_info: { name, tg_id, tg_username },
            user_files: []
        };
    });

    files.forEach(({ user_id, uploaded_to_telegram_at, media_type, tg_file_id }) => {
        const fileDate = new Date(uploaded_to_telegram_at);

        if (fileDate.toDateString() === previousDay.toDateString()) {
            usersMap[user_id].user_files.push({
                type: media_type === 1 ? 'Видео' : 'Фото',
                tg_id: tg_file_id,
                date: uploaded_to_telegram_at
            });
        }
    });

    return usersMap;
};

pool.query('SELECT * FROM users', (err, usersRes) => {
    if (err) {
        console.error('Ошибка при выполнении запроса пользователей:', err);
    } else {
        const users = usersRes.rows;

        pool.query('SELECT * FROM files', (err, filesRes) => {
            if (err) {
                console.error('Ошибка при выполнении запроса файлов:', err);
            } else {
                const files = filesRes.rows;

                const formattedData = formatUserFiles(users, files);

                const filteredUsersWithFiles = Object.keys(formattedData)
                    .filter(key => formattedData[key].user_files.length > 0)
                    .reduce((obj, key) => {
                        obj[key] = formattedData[key];
                        return obj;
                    }, {});

                console.log(JSON.stringify(filteredUsersWithFiles, null, 2));
            }
        });
    }
});
