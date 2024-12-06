import { pool } from './core.js';
import logger from '../logs/logger.js';

const module = import.meta.filename;

/**
 * @returns {Object}
 */
const get_users = async () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * from users`, (err, users) => {
            if (err) {
                logger.error(`Error while executing query to get users data: ${err}`, { module });
                reject(err);
            } else {
                const users_data = users.rows;
                logger.success(`Users successfully recieved from database`, { module });
                resolve(users_data);
            }
        });
    });
};

export { get_users };