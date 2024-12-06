import logger from './logs/logger.js';
import { get_name_by_username } from './utils/common/helper.js';
import { get_download_link } from './utils/yandex_disk';
import { data } from './database/files.js';
import { users } from './database/users.js';
// import { get } from './utils/google/sheets.js';

const module = import.meta.filename;
logger.debug(JSON.stringify(data, null, 2));

/**
 * 
 * оператор	    дата загрузки	        тип контента	   сылка на контент	Принято	Отклонено	Комментарий
 *   Даша	   18.11.2024 18:32:34	 type photo or video	        link         FALSE	   FALSE	some comment
 */
const data_for_web_app = async () => {
    try {
        return Object.entries(data).reduce((x, [k, v]) => {
            Object.values(data[k]).reduce(async (acc, { id, date, type, username, link, path }, i) => {
                const url = await get_download_link(path);
                const name = get_name_by_username(username, users);
                acc[i] = {};
                return acc;
            }, {});
            return x;
        }, {});
    } catch (error) {
        logger.error(`Error in data_for_web_app: ${error}`, { module });
    }
};

export { data_for_web_app };