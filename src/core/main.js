import { constants } from '#config';
import { get_files_data } from '../database/files.js';
import { get_users_data } from '../database/users.js';
import { upload_file_to_drive } from '#drive';
import { process_write_json } from '../modules/process_json.js';
import { get_download_link } from '#yandex_disk';
import { find_name_by_username } from '#common/helper';
import logger from '#logger';

const module = import.meta.filename;
const { IMAGE_LINK, VIDEO_LINK, long, short } = constants;
const obj = {};

/**
 * 
 * #returns
 */
const get_data_for_web_app = async () => {
    try {
        let i = 0;
        const data = await get_files_data();
        const users = await get_users_data();
        const result = {};
        for (const [k, v] of Object.entries(data)) {
            for (const { id, date, type, username, yandex_link, yandex_path } of Object.values(data[k])) {
                if (username !== 'hungryking') {
                    if (yandex_path.includes('.')) {
                        const id = await get_download_link(yandex_path) || '';
                        const name = find_name_by_username(username, users);
                        const file_name = `${name}_${yandex_path}`;
                        const mime_type = type === 'Фото' ? 'image/png' : yandex_path.split('.')[1] === 'MOV' ? 'application/octet-stream' : 'video/mp4';
                        const { file_id, duration } = await upload_file_to_drive(id, file_name, mime_type, type);
                        if (id !== '') obj[i] = { id: file_id };
                        const google_url = type === 'Фото' ? IMAGE_LINK(file_id) : VIDEO_LINK(file_id);
                        if (id !== '') {
                            result[i] = {
                                name,
                                date,
                                username,
                                type: type === `Фото` ? type : duration >= long ? 'Длинное видео' : 'Короткое видео',
                                google_url,
                                accept: 'FALSE',
                                reject: 'FALSE',
                                comment: '',
                                yandex_link,
                                yandex_path
                            };
                            i++;
                        }
                    }
                }
            }
        }

        await process_write_json(obj);

        return result;
    } catch (error) {
        logger.error(`Error in data_for_web_app: ${error}`, { module });
    }
};

export { get_data_for_web_app };