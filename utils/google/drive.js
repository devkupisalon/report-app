import axios from 'axios';
import { Readable } from "stream";
import gauth from './gauth.js';
import logger from '../../logs/logger.js';
import { constants } from '../../constants.js';

const { drive } = gauth();
const { FOLDER_ID } = constants;
const module = import.meta.filename;

const upload_file_to_drive = async (image, name, mimeType) => {
    const response = await axios.get(image, { responseType: 'arraybuffer' });
    const buffer = await response.data;
    console.log(await response);

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
            logger.success(`File uploaded successfully ID: ${id}`, { module });
            return id;
        }
    } catch (error) {
        logger.error(`Error uploading file to Google Drive: ${error}`, { module });
    }
}

const delete_contents_from_folder = async () => {
    try {
        const { data: { files } } = await drive.files.list({
            q: `'${FOLDER_ID}' in parents`,
            fields: 'files(id)',
        });

        if (files && files.length > 0) {
            files.forEach(async (file) => {
                await drive.files.delete({ fileId: file.id });
            });

            logger.success('All contents deleted successfully.', { module });
        } else {
            logger.info('The folder is already empty.', { module });
        }
    } catch (error) {
        logger.error(`Error while deleting content from folder: ${error}`, { module });
    }
}

export { upload_file_to_drive, delete_contents_from_folder };