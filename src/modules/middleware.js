const prepare_obj = (obj) => {
    const unique_ids = {};
    const result = Object.values(obj).reduce((acc, { row }, i) => {
        const elements = row.split(",");
        let [id, , type, date, , , username, , yandex_link, yandex_path] = elements;
        type = type === '1' ? 'Видео' : 'Фото';
        id = id.split(',')[0].substring(1);
        date = date.toString().replaceAll('"', '');
        yandex_path = yandex_path !== '' ? yandex_path.toString().replaceAll('"', '') : yandex_path;
        if (!acc[username]) acc[username] = {};
        if (!unique_ids[id]) {
            acc[username][i] = { id, date, type, username, yandex_link, yandex_path };
        }
        unique_ids[id] = true;
        return acc;
    }, {});
    // console.log(result);
    return result;
};

const create_text_from_object = (req, tg_username) => {
    const filtered_data = Object.values(req)
        .filter(({ username }) => username === tg_username);
    const report = filtered_data
        .map(({ yandex_link, comment }) => {
            if (text !== '') {
                `${yandex_link} - ${comment}`
            }
        })
        .filter(Boolean)
        .join("\n");
    return report;
};

const create_text_and_title_for_google_doc = (report_data, date, req) => {
    const result = report_data.reduce((acc, { name, tg_username }, i) => {
        const title = `${name}_${date.split(' ')[0]}`;
        const text = create_text_from_object(req, tg_username);
        acc[i] = { title, text };
        return acc;
    }, {});
    return result;
};

const update_operator_data = (operatorData, type, accept) => {
    const dataIncrements = {
        'Фото': ['photo_count', 'confirm_photo'],
        'Короткое видео': ['short_video_count', 'short_confirm_video'],
        'Длинное видео': ['long_video_count', 'long_confirm_video']
    };

    operatorData.all_content_count++;

    if (dataIncrements[type]) {
        operatorData[dataIncrements[type][0]]++;
        if (accept === 'TRUE') {
            operatorData[dataIncrements[type][1]]++;
        }
    }
};

const prepare_obj_for_send_message_to_opretor = (data_obj) => {

    const { data, req, settings_plan, date } = data_obj;
    const { name, tg_username } = data;
    const {
        received_photo_count,
        confirmed_photo_count,
        not_accepted_photo_count,
        received_short_video_count,
        confirmed_short_video_count,
        not_accepted_short_video_count,
        received_long_video_count,
        confirmed_long_video_count,
        not_accepted_long_video_count } = process_get_report_statistic(req, tg_username);

    const {
        execution_general_plan,
        execution_photo_plan,
        execution_short_video_plan,
        execution_long_video_plan } = process_check_plans({
            confirmed_photo_count,
            confirmed_short_video_count,
            confirmed_long_video_count
        }, settings_plan);

    return {
        date: date.split(' ')[0],
        name,
        tg_username,
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
        not_accepted_long_video_count
    };
};

const process_get_report_statistic = (data, tg_username) => {

    const type_map = {
        'Фото': 'photo',
        'Короткое видео': 'short_video',
        'Длинное вдиео': 'long_video'
    };

    return Object.values(data).reduce((stats, entry) => {
        const { username, type } = entry;

        if (username === tg_username) {

            const accept_key = `confirmed_${type_map[type]}_count`;
            const reject_key = `not_accepted_${type_map[type]}_count`;

            stats[`received_${type_map[type]}_count`] = (stats[`received_${type_map[type]}_count`] || 0) + 1;
            stats[accept_key] = (entry[accept_key] === "TRUE") ? (stats[accept_key] || 0) + 1 : (stats[accept_key] || 0);
            stats[reject_key] = (entry[reject_key] !== "TRUE") ? (stats[reject_key] || 0) + 1 : (stats[reject_key] || 0);

            return stats;
        }
    }, {});
};

const process_check_plans = (data, settings_plan) => {
    const { photo, short_video, long_video } = settings_plan;
    const { confirmed_photo_count, confirmed_short_video_count, confirmed_long_video_count } = data;

    const plans = {
        execution_photo_plan: confirmed_photo_count >= photo,
        execution_short_video_plan: confirmed_short_video_count >= short_video,
        execution_long_video_plan: confirmed_long_video_count >= long_video,
        execution_general_plan: (confirmed_photo_count + confirmed_short_video_count + confirmed_long_video_count) >= (photo + short_video + long_video)
    };

    return plans;
};

export {
    prepare_obj,
    create_text_and_title_for_google_doc,
    update_operator_data,
    prepare_obj_for_send_message_to_opretor
};