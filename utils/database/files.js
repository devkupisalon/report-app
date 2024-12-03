import { pool } from './core.js';
import logger from '../../logs/logger.js';
import { formatUserFiles } from '../common/helper.js';

let data;
const previousDay = new Date();
previousDay.setDate(previousDay.getDate() - 1);

// get data for check report
const get_data_for_report = () => {
    try {
        pool.query('SELECT * FROM users', (err, usersRes) => {
            if (err) {
                logger.error('Ошибка при выполнении запроса пользователей:', err);
            } else {
                const users = usersRes.rows;
                pool.query('SELECT * FROM files', (err, filesRes) => {
                    if (err) {
                        logger.error('Ошибка при выполнении запроса файлов:', err);
                    } else {
                        const files = filesRes.rows;
                        const formattedData = formatUserFiles(users, files, previousDay);
                        const filteredUsersWithFiles = Object.keys(formattedData)
                            .filter(key => formattedData[key].user_files.length > 0)
                            .reduce((obj, key) => {
                                obj[key] = formattedData[key];
                                return obj;
                            }, {});

                        data = filteredUsersWithFiles;
                    }
                });
            }
        });
        logger.info(`Data successfully recieved`);
        return data;
    } catch (error) {
        logger.error(`Error in get_data_for_report: ${error} `);
    }
};

export { get_data_for_report };

