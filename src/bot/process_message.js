import { constants } from '../config/constants.js';
import logger from '../core/logger.js';
import bot from './init-bot.js';
import { messages } from './messages.js';

const { parse_mode } = constants;
const module = import.meta.filename;

const send_report_to_operator = async (data) => {
    try {
        const { message_id } = await bot.sendMessage(caht_id, messages.operator(data), { parse_mode });
        if (message_id) {
            logger.success(`Message sent successfully to operator ${data.tg_username}`, { module });
        }
    } catch (error) {
        logger.error(`Error in send_report_to_operator: ${error} `, { module });
    }
};

const send_web_app_link_to_user = async () => {
    try {
        const { message_id } = await bot.sendMessage(caht_id, messages.root, { parse_mode });
        if (message_id) {
            logger.success(`Message sent succesfully to responsible manager`, { module });
        }
    } catch (error) {
        logger.error(`Error in send_web_app_link_to_user: ${error}`, { module });
    }
};

export {
    send_web_app_link_to_user,
    send_report_to_operator
};



