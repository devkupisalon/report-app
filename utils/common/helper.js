const getColumnNumberByValue = (values, value) => {
  if (values) {
    const columnNumber = values.indexOf(value) + 1;
    return columnNumber;
  } else {
    return -1;
  }
};

const numberToColumn = (n) => {
  if (n <= 0) n = 1;

  n -= 1;

  let ordA = "A".charCodeAt(0);
  let ordZ = "Z".charCodeAt(0);
  let len = ordZ - ordA + 1;

  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s;
};

const objify = (data) => {
  const headers = data[0];
  return data.slice(1).reduce((acc, row, i) => {
    const obj = headers.reduce((obj, header, j) => {
      obj[header] = row[j];
      return obj;
    }, {});

    acc[i] = obj;
    return acc;
  }, {});
};

const get_name_by_username = (username, users) => {
  for (const [key, value] of Object.entries(users)) {
    if (value['Юзернейм'].toLowerCase() === username.toLowerCase()) {
      return value['Имя'].toLowerCase();
    }
  }
  return "User not found";
};

const get_username_by_name = (username, users) => {
  for (const [key, value] of Object.entries(users)) {
    if (value['Имя'].toLowerCase() === username.toLowerCase()) {
      return value['Юзернейм'].toLowerCase();
    }
  }
  return "User not found";
};

const find_name_by_username = (username, users) => {
  const user = users.find(({ tg_username }) => tg_username === username);
  return user ? user.name : "User not found";
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

export {
  numberToColumn,
  getColumnNumberByValue,
  objify,
  prepare_obj,
  get_name_by_username,
  get_username_by_name,
  find_name_by_username,
  update_operator_data
};
