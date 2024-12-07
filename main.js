import logger from './logs/logger.js';
import { find_name_by_username } from './utils/common/helper.js';
import { get_download_link } from './utils/yandex_disk.js';
import { get_files_data } from './database/files.js';
import { get_users_data } from './database/users.js';
import { constants } from './constants.js';
import { upload_file_to_drive } from './utils/google/drive.js';
import { process_write_json } from './utils/process-json.js';

const module = import.meta.filename;
const { IMAGE_LINK, VIDEO_LINK } = constants;
const obj = {};

const data_for_web_app = async () => {
    try {
        let i = 0;
        const data = await get_files_data();
        const users = await get_users_data();
        const result = {};
        for (const [k, v] of Object.entries(data)) {
            for (const { id, date, type, username, link, path } of Object.values(data[k])) {
                const id = await get_download_link(path) || '';
                const name = find_name_by_username(username, users);
                const file_name = `${name}_${path}`;
                const mime_type = type === 'Фото' ? 'image/png' : path.split('.')[1] === 'MOV' ? 'application/octet-stream' : 'video/mp4';
                let url = await upload_file_to_drive(id, file_name, mime_type);
                url = type === 'Фото' ? IMAGE_LINK(id) : VIDEO_LINK(id);
                if (id !== '') {
                    obj[i] = { id };
                    result[i] = { name, date, type, url, yes: 'FALSE', no: 'FALSE', comment: '', link, path };
                    i++;
                }
            }
        }

        await process_write_json(obj);

        return result;
    } catch (error) {
        logger.error(`Error in data_for_web_app: ${error.stack}`, { module });
    }
};

export { data_for_web_app };