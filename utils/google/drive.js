import axios from 'axios';
import { Readable } from "stream";
import gauth from './gauth.js';
import logger from '../../logs/logger.js';
import { constants } from '../../constants.js';
import { process_return_json } from '../process-json.js';

const { drive } = gauth();
const { FOLDER_ID } = constants;
const module = import.meta.filename;

const upload_file_to_drive = async (image, name, mimeType) => {
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
            logger.success(`File uploaded successfully ID: ${id}`, { module });
            return id;
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
        }
    } catch (error) {
        logger.error(`Error while deleting content from folder: ${error}`, { module });
    }
};

export { upload_file_to_drive, delete_contents_from_folder };