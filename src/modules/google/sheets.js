import { constants } from "@config";
import { convert_array_to_object, get_username_by_name } from "@hcommon/helper";
import logger from "@logger";
import moment from 'moment-timezone';

import { send_report_to_operator } from "../../bot/process_message.js";
import { create_text_and_title_for_google_doc, update_operator_data } from '../middleware.js'
import { add_report_to_document } from "./docs.js";
import { delete_contents_from_folder } from './drive.js';
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
    .reduce((acc, [name, date, type, yandex_link, accept, reject], i) => {
      acc[i] = { name, date, type, yandex_link, accept, reject, comment: '' };
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
    .map(({ name, date, type, yandex_link, accept, reject, comment }) =>
      [name, date, type, yandex_link, accept, reject, comment]) : req.values;

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

const save_report = async (req) => {
  try {
    const range_link = await save_detailed_report(req, true);
    const settings = await get_settings();
    const { photo, short_video, long_video } = settings['План'][0];
    const config_map = settings['Настройки'];

    const date = moment();
    const timeZone = 'Europe/Moscow';
    const date_and_time = date.tz(timeZone).format('DD.MM.YYYY HH:mm:ss');

    const reportData = Object.values(req)
      .map(({ name, date, type, yandex_link, accept, reject }) => {
        return { name, date, type, yandex_link, accept, reject };
      });

    const operatorsData = reportData.reduce((acc, { name, type, accept, reject }) => {
      const operatorIndex = acc.findIndex(operator => operator.name === name);
      if (operatorIndex === -1) {
        const tg_username = get_username_by_name(name, config_map);
        acc.push({
          name,
          tg_username,
          all_content_count: 1,
          photo_count: type === 'Фото' ? 1 : 0,
          short_video_count: type == 'Котроткое видео' ? 1 : 0,
          long_video_count: type == 'Длинное видео' ? 1 : 0,
          photo_accept: accept === 'TRUE' ? 1 : 0,
          short_video_accept: reject === 'TRUE' ? 1 : 0,
          long_video_accept: reject === 'TRUE' ? 1 : 0,
          photo_plan: photo,
          short_video_plan: short_video,
          long_video_plan: long_video,
          range_link
        });
      } else {
        update_operator_data(acc[operatorIndex], type, accept, reject);
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
      const google_doc_report_links = await add_report_to_document(google_doc_obj_data);
      await send_report_to_operator(report_data, google_doc_report_links, settings['План'], date_and_time);
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
