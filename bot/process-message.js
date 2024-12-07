import bot from './init-bot.js';
import logger from '../logs/logger.js';
import { constants } from '../constants.js';

const { parse_mode } = constants;
const module = import.meta.filename;


const send_report_to_operator = async (data) => {
    try {

    } catch (error) {
        logger.error(`Error in send_report_to_operator: ${error} `, { module });
    }
};

const send_web_app_link_to_user = async (data) => {
    try {

    } catch (error) {
        logger.error(`Error in send_web_app_link_to_user: ${error}`);
    }
};



