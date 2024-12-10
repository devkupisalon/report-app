const prepare_obj = (obj) => {
    const unique_ids = {};
    return Object.values(obj).reduce((acc, { row }, i) => {
        const elements = row.split(",");
        let [id, , type, date, , , username, , link, path] = elements;
        type = type === '1' ? 'Видео' : 'Фото';
        id = id.split(',')[0].substring(1);
        date = date.toString().replaceAll('"', '');
        path = path !== '' ? path.toString().replaceAll('"', '') : path;
        if (!acc[username]) acc[username] = {};
        if (!unique_ids[id]) {
            acc[username][i] = { id, date, type, username, link, path };
        }
        unique_ids[id] = true;
        return acc;
    }, {});
};

const create_text_and_title_for_google_doc = (report_data, date) => {
    const result = report_data.reduce((acc, { name, date }) => {
        const title = `${name}_${date.split(' ')[0]}`;
        const text =
            acc[name] = { title, text };
        return acc;
    }, {});
    return result;
};

const update_operator_data = (operatorData, type, yes, no) => {
    const dataIncrements = {
        'Фото': ['photo_count', 'confirm_photo'],
        'Видео': ['video_count', 'confirm_video'],
    };

    operatorData.content_count++;

    if (dataIncrements[type]) {
        operatorData[dataIncrements[type][0]]++;
        if (yes === 'TRUE') {
            operatorData[dataIncrements[type][1]]++;
        }
    }
};

export {
    prepare_obj,
    create_text_and_title_for_google_doc,
    update_operator_data
};