const prepare_obj = (obj) => {
    const unique_ids = {};
    return Object.values(obj).reduce((acc, { row }, i) => {
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
};

const create_text_and_title_for_google_doc = (report_data, date) => {
    const result = report_data.reduce((acc, { name }) => {
        const title = `${name}_${date.split(' ')[0]}`;
        const text =
            acc[name] = { title, text };
        return acc;
    }, {});
    return result;
};

const update_operator_data = (operatorData, type, accept) => {
    const dataIncrements = {
        'Фото': ['photo_count', 'confirm_photo'],
        'Видео': ['video_count', 'confirm_video'],
    };

    operatorData.content_count++;

    if (dataIncrements[type]) {
        operatorData[dataIncrements[type][0]]++;
        if (accept === 'TRUE') {
            operatorData[dataIncrements[type][1]]++;
        }
    }
};

export {
    prepare_obj,
    create_text_and_title_for_google_doc,
    update_operator_data
};