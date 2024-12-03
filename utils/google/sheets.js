import gauth from "./gauth.js";
import { constants } from "../../constants.js";
import logger from "../../logs/logger.js";
import { getColumnNumberByValue, numberToColumn } from "../common/helper.js";

const { sheets } = gauth();

const {
  DETAILED_LOG_SHEETNAME,
  SETTINGS_SHEETNAME,
  REPORTS_SHEETNAME,
  PLAN_SHEET_NAME,
} = constants;

/**
 * Update data in a specific range of a Google Spreadsheet.
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} range - The range in the spreadsheet to update.
 * @param {Object} requestBody - The request body containing the data to update.
 * @returns {Object} - The updated data.
 */
const update_data = async (spreadsheetId, range, sheetname, requestBody) => {
  const values = await get_data(spreadsheetId, source_range);
  const row = values.length + 2;
  const range = `${sheetname}!A${row}`;
  const { data } = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody,
  });
  return { data };
};

/**
 * Получить данные из указанного диапазона в таблице Google Sheets
 * @param {string} spreadsheetId - Идентификатор таблицы Google Sheets
 * @param {string} range - Диапазон данных для извлечения
 * @returns {Array} - Массив значений из таблицы
 */
const get_data = async (spreadsheetId, range) => {
  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return values;
};

/**
 * Asynchronous function get_data to retrieve data from Google Sheets by spreadsheet ID and range.
 * @param {string} spreadsheetId - The ID of the Google Sheets spreadsheet.
 * @param {Array} ranges - The ranges  array of data to retrieve.
 * @returns {Array} - An array of data values from the spreadsheet.
 */
const get_all_data = async (spreadsheetId, ranges) => {
  try {
    const {
      data: { valueRanges },
    } = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges, // Add multiple ranges you want to retrieve data from
    });

    const obj = valueRanges.reduce((acc, { values, range }, i) => {
      if (i === 2) {
        const col_i = getColumnNumberByValue(values[0], sourcevalue);
        acc[range.replace(/!.*/g, "")] = values
          .map((r) => r[col_i - 1])
          .filter(Boolean)
          .slice(1);
      } else {
        acc[range.replace(/!.*/g, "")] = values;
      }
      return acc;
    }, {});

    return obj;
  } catch (error) {
    logger.error(`Error in get_all_data: ${error.message}`);
  }
};

const save_report_data = async (req, spreadsheetId, sheetname) => {
  const data_values = await get_data(spreadsheetId, sheetname);
  const row = data_values.length + 2;
  const range = `${sheetname}!A${row}`;
  const requestBody = { values: req.values };
  const { data } = await update_data(spreadsheetId, range, requestBody);
};

/**
 * Asynchronous function to retrieve settings from Google Sheets.
 * @returns {Object} Configuration object containing settings and plans.
 */
const get_settings = async () => {
  try {
    const ranges = [SETTINGS_SHEETNAME, PLAN_SHEET_NAME];
    const obj = await get_all_data(REPORTS_SPREADSHEET_ID, ranges);
    const func_map = {
      "Настройки": (data) => {
        return data.slice(1).reduce(
          (acc, [name, username, phone, is_active, role]) => {
            if (!acc[username]) acc[username] = { name, phone, is_active, role };
            return acc;
          }, {});
      },
      "План": (data) => {
        return data.slice(1).reduce((acc, [photo_count, short_video_count, long_video_count]) => {
          acc.plan = { photo_count, short_video_count, long_video_count };
          return acc;
        }, {});
      }
    };

    const config_obj = Object.entries(obj).reduce((acc, [k, v]) => {
      if (!acc[k]) acc[k] = func_map[k](v);
      return acc;
    }, {});

    return config_obj;
  } catch (error) {
    logger.error(`Error in get_settings: ${error}`);
  }
};

export {
  get_all_data,
  get_settings
};
