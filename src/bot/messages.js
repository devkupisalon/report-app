import { constants } from '../config/constants.js';

const { check_map } = constants;

const messages = {
    operator: (data) => {
        const {
            date,
            name,
            tg_username,
            google_doc_report_link,
            execution_general_plan,
            execution_photo_plan,
            execution_short_video_plan,
            execution_long_video_plan,
            received_photo_count,
            confirmed_photo_count,
            not_accepted_photo_count,
            received_short_video_count,
            confirmed_short_video_count,
            not_accepted_short_video_count,
            received_long_video_count,
            confirmed_long_video_count,
            not_accepted_long_video_count,
        } = data;
        `Отчет: ${date}
Оператор: ${name} (${tg_username})
Общий план: ${check_map[execution_general_plan]}  
                                    
📷 ${check_map[execution_photo_plan]}
Прислано ${received_photo_count}
Принято ${confirmed_photo_count}
Не принято ${not_accepted_photo_count}

🩳 ${check_map[execution_short_video_plan]}
Прислано ${received_short_video_count}
Принято ${confirmed_short_video_count}
Не принято ${not_accepted_short_video_count}

🎥 ${check_map[execution_long_video_plan]}
Прислано ${received_long_video_count}
Принято ${confirmed_long_video_count} 
Не принято ${not_accepted_long_video_count}

[Отчет](${google_doc_report_link})`
    },
    root: (previous_date) => `Контент, полученный за *${previous_date}* готов к проверке и доступен по [ссылке](${WEB_APP_LINK})`
};

export { messages };