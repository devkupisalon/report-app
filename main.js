import logger from './logs/logger.js';
import { find_name_by_username } from './utils/common/helper.js';
import { get_download_link } from './utils/yandex_disk.js';
import { get_files_data } from './database/files.js';
import { get_users_data } from './database/users.js';

const module = import.meta.filename;

/**
 * 
 * оператор	    дата загрузки	        тип контента	   сылка на контент	Принято	Отклонено	Комментарий
 *   Даша	   18.11.2024 18:32:34	 type photo or video	        link         FALSE	   FALSE	some comment
 */
const data_for_web_app = async () => {
    try {
        const data = await get_files_data();
        const users = await get_users_data();
        logger.info(JSON.stringify(users, null, 2), { module });
        const result = {};
        for (const [k, v] of Object.entries(data)) {
            const filesData = {};
            for (const { id, date, type, username, link, path } of Object.values(data[k])) {
                const url = await get_download_link(path);
                const name = find_name_by_username(username, users);
                filesData[id] = { name, date, type, url, yes: 'FALSE', no: 'FALSE', comment: '', link };
            }
            result = { ...filesData };
        }

        return result;
    } catch (error) {
        logger.error(`Error in data_for_web_app: ${error.stack}`, { module });
    }
};

data_for_web_app()

export { data_for_web_app };