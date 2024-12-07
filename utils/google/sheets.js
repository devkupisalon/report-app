import moment from 'moment-timezone';

import gauth from "./gauth.js";
import { constants } from "../../constants.js";
import logger from "../../logs/logger.js";
import { delete_contents_from_folder } from './drive.js';

import {
  getColumnNumberByValue,
  objify,
  update_operator_data,
  get_username_by_name
} from "../common/helper.js";

const { sheets } = gauth();
const module = import.meta.filename;

const {
  REPORTS_SPREADSHEET_ID,
  DETAILED_LOG_SHEETNAME,
  SETTINGS_SHEETNAME,
  REPORTS_SHEETNAME,
  PLAN_SHEET_NAME,
  SS_LINK
} = constants;

/**
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} range - The range in the spreadsheet to update.
 * @param {Object} requestBody - The request body containing the data to update.
 * @returns {Object} - The updated data.
 */
const update_data = async (spreadsheetId, range, requestBody) => {
  const { data } = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody,
  });
  return { data };
};

const get_data = async (spreadsheetId, range) => {
  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return values
    .slice(1)
    .reduce((acc, [name, date, type, link, yes, no], i) => {
      acc[i] = { name, date, type, link, yes, no, comment: '' };
      return acc;
    }, {});
};

/**
 * 
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
      ranges,
    });

    const obj = valueRanges.reduce((acc, { values, range }, i) => {
      if (i === 2) {
        const col_i = getColumnNumberByValue(values[0], sourcevalue);
        acc[range.match(/\'(.*?)\'/)[1]] = values
          .map((r) => r[col_i - 1])
          .filter(Boolean)
          .slice(1);
      } else {
        acc[range.match(/\'(.*?)\'/)[1]] = values;
      }
      return acc;
    }, {});

    return obj;
  } catch (error) {
    logger.error(`Error in get_all_data: ${error.message}`, { module });
  }
};

/**
 * range link sample https://docs.google.com/spreadsheets/d/1QGLg8UqnIeyBeu_Whw_GuTESJ2j-WI88mepEzl7cuNA/edit?gid=1195915836#gid=1195915836&range=2:15
 * @param {Object} req 
 * @param {String} spreadsheetId 
 * @param {String} sheetname 
 * @param {Boolean} detailed 
 * @returns {Object}
 */
const save_report_data = async (req, spreadsheetId, sheetname, detailed = false) => {
  let values_range;

  const data_values = await get_data(spreadsheetId, sheetname);
  const length = Object.keys(data_values).length;
  const row = length + 2;
  const range = `${sheetname}!A${row}`;

  const values = detailed ? Object.values(req)
    .map(({ name, date, type, link, yes, no, comment }) =>
      [name, date, type, link, yes, no, comment]) : req.values;

  detailed ? values_range = `${SS_LINK}/${spreadsheetId}/edit?gid=1195915836#gid=1195915836&range=${row}:${row + values.length - 1}` : null;

  const requestBody = { values };
  const { data } = await update_data(spreadsheetId, range, requestBody);
  return data.spreadsheetId ? { success: true, range: values_range } : { success: false, range: null };
};

/**
 * 
 * @param {Object} req 
 * @param {Boolean} detailed 
 * @returns 
 */
const save_detailed_report = async (req, detailed) => {
  try {
    const { success, range } = await save_report_data(req, REPORTS_SPREADSHEET_ID, DETAILED_LOG_SHEETNAME, detailed);
    if (success) {
      logger.success(`Detailed Report saved successfully`, { module });
      if (range !== null) {
        return range;
      }
    }
  } catch (error) {
    logger.error(`Error in save_detailed_report: ${error}`, { module });
  }
};

/**
 * row sample
 * дата отчета	имя оператора	телеграм	кол-во загруженного контента	фото	видео	принято фото	принято видео	План фото	План видео	ссылка на подробный отчет
 * 29.11.2024	     Дарья	  Darya_Akulich	            21	             18	    3	       15	             2	        18	       3	            range_link
 * @param {object} req 
 */
const save_report = async (req) => {
  try {
    const range_link = await save_detailed_report(req, true);
    const settings = await get_settings();
    const { photo, short_video, long_video } = settings['План'][0];
    const video = parseInt(Number(short_video) + Number(long_video));
    const config_map = settings['Настройки'];

    const date = moment();
    const timeZone = 'Europe/Moscow';
    const date_and_time = date.tz(timeZone).format('DD.MM.YYYY HH:mm:ss');

    const reportData = Object.values(req)
      .map(({ name, date, type, link, yes, no }) => {
        return { name, date, type, link, yes, no };
      });

    const operatorsData = reportData.reduce((acc, { name, type, yes, no }) => {
      const operatorIndex = acc.findIndex(operator => operator.name === name);
      if (operatorIndex === -1) {
        const tg_username = get_username_by_name(name, config_map);
        acc.push({
          name,
          tg_username,
          content_count: 1,
          photo_count: type === 'Фото' ? 1 : 0,
          video_count: type === 'Видео' ? 1 : 0,
          confirm_photo: yes === 'TRUE' ? 1 : 0,
          confirm_video: no === 'TRUE' ? 1 : 0,
          photo,
          video,
          range_link
        });
      } else {
        update_operator_data(acc[operatorIndex], type, yes, no);
      }
      return acc;
    }, []);

    const report_data = operatorsData
      .map((data) => [date_and_time, ...Object.values(data)]);

    const { success } = await save_report_data(
      { values: report_data },
      REPORTS_SPREADSHEET_ID,
      REPORTS_SHEETNAME
    );

    const names = report_data.map(r => r[1]).join(', ');

    if (success) {
      logger.success(`Report Data for [${names}] saved successfully`, { module });
      await delete_contents_from_folder();
    }
  } catch (error) {
    logger.error(`Error in save_report: ${error}`, { module });
  }
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
        return objify(data);
      },
      "План": (data) => {
        return objify(data)
      }
    };

    const config_obj = Object.entries(obj).reduce((acc, [k, v]) => {
      if (!acc[k]) acc[k] = func_map[k](v);
      return acc;
    }, {});

    return config_obj;
  } catch (error) {
    logger.error(`Error in get_settings: ${error}`, { module });
  }
};

export {
  get_all_data,
  get_settings,
  save_detailed_report,
  save_report
};
