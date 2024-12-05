import bot from "../bot/init-bot.js";
import logger from "../../logs/logger.js";
import { constants } from "../../constants.js";

const { BOT_TOKEN } = constants;

/**
 * Возвращает номер столбца, содержащего указанное значение, на указанном листе.
 * @param {Sheet} sheet - Лист, на котором производится поиск.
 * @param {string} value - Значение, которое нужно найти.
 * @returns {number} - Номер столбца, где найдено значение. Если значение не найдено, возвращается -1.
 */
function getColumnNumberByValue(values, value) {
  // const row = values.find(row => row.includes(value));

  if (values) {
    const columnNumber = values.indexOf(value) + 1;
    return columnNumber;
  } else {
    return -1;
  }
}

/**
 * Преобразует число в соответствующую строку столбца в таблице Google Sheets.
 * @param {number} n - Число для преобразования.
 * @return {string} - Строка с соответствующим значением столбца.
 */
function numberToColumn(n) {
  /* Google Sheets использует A = 1, мы вычисляем, начиная с 0 */
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
}

/**
* Retrieve file URLs from Telegram based on the provided files data.
* @param {String} files - Object or Array containing data of files to be processed.
* @returns {string} - An array of file URLs if multiple files are provided, or a single file URL.
*/
const getTelegramFiles = async (file_id) => {
  try {
    const { file_path } = await bot.getFile(file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file_path}`;
    logger.info(`File url successfully received: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    logger.error(`Error in getTelegramFiles: ${error}`);
  }
};

// get files by users
const formatUserFiles = (users, files, previousDay) => {
  const usersMap = {};
  const filteredUsers = users.filter(({ role }) => role === 3);

  filteredUsers.forEach(({ name, user_id, tg_id, tg_username }) => {
    usersMap[user_id] = {
      user_info: { name, tg_id, tg_username },
      user_files: []
    };
  });

  files.forEach(({ user_id, uploaded_to_telegram_at, media_type, tg_file_id }) => {
    const fileDate = new Date(uploaded_to_telegram_at);
    if (fileDate.toDateString() === previousDay.toDateString()) {
      usersMap[user_id].user_files.push({
        type: media_type === 1 ? 'Видео' : 'Фото',
        tg_id: tg_file_id,
        date: uploaded_to_telegram_at
      });
    }
  });

  return usersMap;
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

const getNameByUsername = (username, users) => {
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

const sortObjectByTime = (data) => {
  const sortedData = {};
  for (const owner in data) {
    const userEntries = Object.entries(data[owner]);
    const sortedEntries = userEntries.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a[1].time}`);
      const timeB = new Date(`1970/01/01 ${b[1].time}`);
      return timeA - timeB;
    });
    const map = sortedEntries.map(([index, { id, name, date, type, owner, link, path_link, time }]) =>
      ({ id, index, name, date, type, owner, link, path_link, time }));
    sortedData[owner] = map;
  }

  return sortedData;
};

const filterObjectsByYesterdayDate = (object, yesterday) => {
  const result = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const date = new Date(object[key].date);
      if (date.toDateString() === yesterday.toDateString()) {
        if (!result[object[key].owner]) result[object[key].owner] = {};
        result[object[key].owner][key] = object[key];
      }
    }
  }

  return sortObjectByTime(result);
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
  numberToColumn,
  getColumnNumberByValue,
  getTelegramFiles,
  formatUserFiles,
  objify,
  getNameByUsername,
  get_username_by_name,
  filterObjectsByYesterdayDate,
  update_operator_data
};
