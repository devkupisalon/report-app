import { constants } from '../config/constants.js';

const { middleware } = constants;

const messages = {
    operator: (data) => {
        const {
            date,
            name,
            tg_username,
            google_doc_report_link,
            general_plan,
            photo_plan,
            short_video_plan,
            long_video_plan,
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
Общий план: ${middleware[general_plan]}  
                                    
📷 ${middleware[photo_plan]}
Прислано ${received_photo_count}
Принято ${confirmed_photo_count}
Не принято ${not_accepted_photo_count}

🩳 ${middleware[short_video_plan]}
Прислано ${received_short_video_count}
Принято ${confirmed_short_video_count}
Не принято ${not_accepted_short_video_count}

🎥 ${middleware[long_video_plan]}
Прислано ${received_long_video_count}
Принято ${confirmed_long_video_count} 
Не принято ${not_accepted_long_video_count}

[Отчет](${google_doc_report_link})`
    },
    root: ``
};

export { messages };