import { pool } from './core.js';
import logger from '../../logs/logger.js';
import { formatUserFiles } from '../common/helper.js';

let data;
const previousDay = new Date();
// previousDay.setDate(previousDay.getDate() - 1);

const get_data_for_report = async () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users', async (err, usersRes) => {
            if (err) {
                logger.error('Ошибка при выполнении запроса пользователей:', err);
                reject(err);
            } else {
                const users = usersRes.rows;
                pool.query('SELECT * FROM files', (err, filesRes) => {
                    if (err) {
                        logger.error('Ошибка при выполнении запроса файлов:', err);
                        reject(err);
                    } else {
                        const files = filesRes.rows;
                        const formattedData = formatUserFiles(users, files, previousDay);
                        const filteredUsersWithFiles = Object.keys(formattedData)
                            .filter(key => formattedData[key].user_files.length > 0)
                            .reduce((obj, key) => {
                                obj[key] = formattedData[key];
                                return obj;
                            }, {});

                        logger.info(`Data successfully received`);
                        resolve(filteredUsersWithFiles); // Возвращаем данные через resolve
                    }
                });
            }
        });
    });
};

const get_all_tables = async () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'', (err, tablesRes) => {
            if (err) {
                logger.error('Error while executing query for tables:', err);
                reject(err);
            } else {
                const tables = tablesRes.rows.map(row => row.table_name);
                logger.info('All tables successfully retrieved');
                logger.info(tables);
                resolve(tables);
            }
        });
    });
};

const get_first_10_logs = async () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT (files.file_id, files.name, files.media_type, files.uploaded_to_telegram_at, files.uploaded_to_yandex_at, files.uploaded_to_google_at, users.tg_username, file_links.storage_type, file_links.file_link, file_links.directory_name, file_links.directory_link) FROM files JOIN users ON files.user_id = users.user_id LEFT JOIN file_links ON files.file_id = file_links.file_id ORDER BY files.uploaded_to_google_at DESC NULLS LAST', (err, logsRes) => {
            if (err) {
                logger.error('Error while executing query for first 10 logs:', err);
                reject(err);
            } else {
                const logs = logsRes.rows;
                logger.info('First 10 logs successfully retrieved');
                logger.info(logs);
                resolve(logs);
            }
        });
    });
};

get_first_10_logs();

// get_all_tables();

export { get_data_for_report };

