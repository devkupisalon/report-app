
import logger from '../../logs/logger.config.js';
import { YandexDisk } from 'yandex-disk';
import { constants } from '../../constants.js';

const { YA_DISK_OAUTH_TOKEN } = constants;
const module = import.meta.filename;
const disk = new YandexDisk({
    token: YA_DISK_OAUTH_TOKEN
});

const get_download_link = async (path) => {
    try {
        const { data } = await disk.getDownloadLinkByPath({ path });
        if (data) {
            logger.success(`Direct Download Link: ${data.href}`, { module });
            return data.href;
        }
    } catch (error) {
        logger.error(`Error in get_download_link: ${error}`, { module });
    }
};

const check_token_validity = async () => {
    try {
        await disk.checkToken();
        logger.debug('Token is valid', { module });
    } catch (error) {
        logger.error(`Invalid Token: ${error}`, { module });
    }
};

export { check_token_validity, get_download_link };