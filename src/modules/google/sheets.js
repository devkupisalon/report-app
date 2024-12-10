import { get_username_by_name, convert_array_to_object } from "../common/helper.js";
import { update_operator_data, create_text_and_title_for_google_doc } from '../middleware/middleware.js'
import moment from 'moment-timezone';

import { constants } from "../../config/constants.js";
import logger from "../../core/logger.js";
import { delete_contents_from_folder } from './drive.js';
import { add_report_to_document } from "./docs.js";
import { send_report_to_operator } from "../../bot/process_message.js";
import gauth from "./gauth.js";

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
 * range link sample https://docs.google.com/spreadsheets/d/1QGLg8UqnIeyBeu_Whw_GuTESJ2j-WI88mepEzl7cuNA/edit?gid=1195915836#gid=1195915836&range=2:15
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
      const google_doc_obj_data = create_text_and_title_for_google_doc(report_data, date_and_time, req);
      const google_doc_report_link = await add_report_to_document(report_data);
      await send_report_to_operator({ ...google_doc_obj_data, google_doc_report_link });
      await delete_contents_from_folder();
    }
  } catch (error) {
    logger.error(`Error in save_report: ${error}`, { module });
  }
};

const get_settings = async () => {
  try {
    const ranges = [SETTINGS_SHEETNAME, PLAN_SHEET_NAME];
    const obj = await get_all_data(REPORTS_SPREADSHEET_ID, ranges);
    const func_map = {
      "Настройки": (data) => {
        return convert_array_to_object(data);
      },
      "План": (data) => {
        return convert_array_to_object(data)
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
  get_settings,
  save_detailed_report,
  save_report
};
