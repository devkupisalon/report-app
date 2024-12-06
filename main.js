import logger from './logs/logger.js';
import { find_name_by_username } from './utils/common/helper.js';
import { get_download_link } from './utils/yandex_disk.js';
import { data } from './database/files.js';
import { users } from './database/users.js';

const module = import.meta.filename;

/**
 * 
 * оператор	    дата загрузки	        тип контента	   сылка на контент	Принято	Отклонено	Комментарий
 *   Даша	   18.11.2024 18:32:34	 type photo or video	        link         FALSE	   FALSE	some comment
 */
const data_for_web_app = () => {
    return new Promise((resolve, reject) => {
        try {
            const result = Object.entries(data).reduce(async (x, [k, v]) => {
                return Object.values(data[k]).reduce(async (acc, { id, date, type, username, link, path }, i) => {
                    const url = await get_download_link(path);
                    logger.info(url, { module });
                    const name = find_name_by_username(username, users);
                    acc[i] = { name, date, type, url, yes: 'FALSE', no: 'FALSE', comment: '', link };
                    return acc;
                }, {});
            }, {});
            resolve(result);
        } catch (error) {
            logger.error(`Error in data_for_web_app: ${error}`, { module });
            reject(error);
        }
    });
};

const x = await data_for_web_app();
logger.debug(x, { module });

export { data_for_web_app };