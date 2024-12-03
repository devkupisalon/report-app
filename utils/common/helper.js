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

// Get file_id with high quality
const HQD_photo = (photo) =>
  photo.reduce((prev, current) =>
    prev.file_size > current.file_size ? prev : current
  );

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
      } catch (error) {
        logger.error(`Error in getTelegramFiles: ${error}`);
      }
  return fileUrl;
};

// get files by users
const formatUserFiles = (users, files) => {
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

export {
  numberToColumn,
  getColumnNumberByValue,
  HQD_photo,
  getTelegramFiles,
  formatUserFiles
};
