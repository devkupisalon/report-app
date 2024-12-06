
import logger from '../logs/logger.js';
import axios from 'axios';
import { constants } from '../constants.js';

const { YA_DISK_OAUTH_TOKEN } = constants;
const module = import.meta.filename;

const get_download_link = async (path, link) => {
    if (path === '') return;
    try {
        const { data } = await axios.get(`https://cloud-api.yandex.net/v1/disk/resources/download?path=${encodeURIComponent(path)}`, {
            headers: {
                Authorization: `OAuth ${YA_DISK_OAUTH_TOKEN}`
            }
        });
        if (data) {
            logger.success(`Download link received for file: [${path}], link: ${link}`, { module });
            return data.href;
        }
    } catch (error) {
        logger.error(`Error while get_download_link for file: [${path}], link: ${link}, error: ${error}`, { module });
    }
};

const check_token_validity = async () => {
    try {
        const { data } = await axios.get('https://cloud-api.yandex.net/v1/disk', {
            headers: {
                Authorization: `OAuth ${YA_DISK_OAUTH_TOKEN}`
            }
        });
        if (data) {
            logger.debug('Token is valid', { module });
        }
    } catch (error) {
        logger.error(`Invalid Token: ${error}`, { module });
    }
};

export { check_token_validity, get_download_link };