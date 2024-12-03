import logger from './logs/logger.js';
import { get_data_for_report } from './utils/database/files.js';
import { constants } from './constants.js';
import { getTelegramFiles } from './utils/common/helper.js';

const get_all_data_for_web_app = async () => {
    try {
        const data = get_data_for_report();
        logger.info(data);
        const data_for_check = Object.entries(data).reduce((acc, [k, v]) => {
            let { user_info, user_files } = v;
            user_files = user_files.map(async ({ tg_id, type, date }) => ({
                file: await getTelegramFiles(tg_id), type, date
            }));
            acc[k] = { user_info, user_files };
            return acc;
        }, {});
        console.log(JSON.stringify(data_for_check, null, 2));
        return { data: data_for_check };
    } catch (error) {
        logger.error(`Error in get_all_data_for_web_app: ${error} `);
    }
};

export { get_all_data_for_web_app };