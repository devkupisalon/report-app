import logger from '#logger';
import { prepare_obj } from '#middleware';

import { pool } from './core.js';

let data;
const module = import.meta.filename;

const get_files_statistics = (yesterdayDate) => {
    return new Promise((resolve, reject) => {
        // const yesterday = new Date();
        // yesterday.setDate(yesterday.getDate() - 2);
        // const yesterdayDate = yesterday.toISOString().split('T')[0];

        pool.query(`SELECT (files.file_id, files.name, files.media_type, files.uploaded_to_telegram_at, files.uploaded_to_yandex_at, files.uploaded_to_google_at, users.tg_username, file_links.storage_type, file_links.file_link, file_links.directory_name, file_links.directory_link) 
                    FROM files 
                    JOIN users ON files.user_id = users.user_id 
                    LEFT JOIN file_links ON files.file_id = file_links.file_id 
                    WHERE date(files.uploaded_to_telegram_at) = $1 AND users.role = 3 
                    ORDER BY files.uploaded_to_google_at DESC NULLS LAST`, [yesterdayDate], (err, logsRes) => {
            if (err) {
                logger.error(`Error while executing query to get files data: ${err}`, { module });
                reject(err);
            } else {
                const logs = logsRes.rows;
                logger.success(`Files data successfully received from database`, { module });
                resolve(logs);
            }
        });
    });
};

const get_files_data = async () => {
    try {
        data = await get_files_statistics();
        data = prepare_obj(data);
        return data;
    } catch (error) {
        logger.error(error, { module });
    }
};

export { get_files_data };

