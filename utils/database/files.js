import { pool } from './core.js';
import logger from '../../logs/logger.js';
import { formatUserFiles } from '../common/helper.js';

let data;
const previousDay = new Date();
previousDay.setDate(previousDay.getDate() - 1);

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

pool.query('SELECT * FROM file_links', (err, filesRes) => {
    if (err) {
        logger.error('Ошибка при выполнении запроса файлов:', err);
    } else {
        const files = filesRes.rows;
        logger.info(files);
    }
});



export { get_data_for_report };

