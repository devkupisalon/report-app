import { constants } from '#config';
import logger from '#logger';
import axios from 'axios';
import { Readable } from "stream";

import { process_return_json, process_write_json } from '../process_json.js';
import gauth from './gauth.js';

const { drive } = gauth();
const { FOLDER_ID } = constants;
const module = import.meta.filename;

const upload_file_to_drive = async (image, name, mimeType, type) => {
    let duration;
    if (image === '') return '';
    const response = await axios.get(image, { responseType: 'arraybuffer' });
    const buffer = await response.data;

    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = { name, parents: [FOLDER_ID] };
    const media = { mimeType, body: fileStream };

    try {
        const { data: { id } } = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id',
        });

        if (id) {
            await drive.permissions.create({
                fileId: id,
                requestBody: {
                    role: "writer",
                    type: "anyone"
                },
            });

            if (type !== 'Фото') {
                duration = await get_video_length(id);
            }
            
            logger.success(`File uploaded successfully ID: ${id}`, { module });
            return { id, duration };
        }
    } catch (error) {
        logger.error(`Error uploading file to Google Drive: ${error}`, { module });
    }
};

const delete_contents_from_folder = async () => {
    try {
        const data = await process_return_json();

        let obj = {};
        Object.values(data).forEach(async ({ id }, i) => {
            const data = await drive.files.delete({ fileId: id });
            if (data.id) {
                obj[i] = 'success';
            }
        });
        if (Object.values(obj).every(t => t === 'success')) {
            logger.success('All contents deleted successfully.', { module });
            await process_write_json({});
        }
    } catch (error) {
        logger.error(`Error while deleting content from folder: ${error}`, { module });
    }
};

const get_video_length = async (fileId) => {
    try {
        const response = await drive.files.get({
            fileId,
            fields: 'videoMediaMetadata',
        });

        const videoMetadata = response.data.videoMediaMetadata;
        if (videoMetadata && videoMetadata.durationMillis) {
            const durationSeconds = videoMetadata.durationMillis / 1000;
            return durationSeconds;
        } else {
            return "Duration not found";
        }
    } catch (error) {
        logger.error("Произошла ошибка:", error.message);
    }
}

export { upload_file_to_drive, delete_contents_from_folder };