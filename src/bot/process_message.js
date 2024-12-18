import { constants } from '#config';
import logger from '#logger';
import { get_formatted_date, get_previous_workday_and_weekend_info } from '#common/helper';

import { prepare_obj_for_send_message_to_opretor } from '#middleware';
import bot from './init-bot.js';
import { messages } from './messages.js';
import { get_user_id_by_username } from '#common/helper';
import { get_users_data } from '#users';

const { parse_mode, CHAT_ID, ROOT_CHAT_ID } = constants;
const module = import.meta.filename;

const send_report_to_operator_and_root = async (report_data, google_doc_report_links, req, settings_plan, date) => {
    const users = await get_users_data();
    try {
        report_data.forEach(async (data, i) => {
            const google_doc_report_link = google_doc_report_links[i];
            const username = data.tg_username;
            const chat_id = get_user_id_by_username(users, username);
            const obj_for_send_message = prepare_obj_for_send_message_to_opretor({ date, settings_plan, data, req });
            const { message_id } = await bot.sendMessage(chat_id, messages.operator({ ...obj_for_send_message, google_doc_report_link }), { parse_mode });
            await bot.sendMessage(ROOT_CHAT_ID, messages.operator({ ...obj_for_send_message, google_doc_report_link }), { parse_mode });
            if (message_id) {
                logger.success(`Message sent successfully to operator ${username}`, { module });
            }
        });
    } catch (error) {
        logger.error(`Error in send_report_to_operator: ${error} `, { module });
    }
};

const send_web_app_link_to_user = async () => {
    try {
        const { previous_workday } = get_previous_workday_and_weekend_info();
        const previous_date = get_formatted_date(previous_workday);
        const { message_id } = await bot.sendMessage(CHAT_ID, messages.root(previous_date), { parse_mode });
        if (message_id) {
            logger.success(`Message sent succesfully to responsible manager`, { module });
        }
    } catch (error) {
        logger.error(`Error in send_web_app_link_to_user: ${error}`, { module });
    }
};

export {
    send_web_app_link_to_user,
    send_report_to_operator_and_root
};



