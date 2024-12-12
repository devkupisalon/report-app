import { promises as fs } from "fs";
import logger from "@lo";
import { constants } from "@config";

const module = import.meta.filename;

const { JSON_PATH } = constants;

const process_write_json = async (global_obj) => {
  const data = JSON.stringify(global_obj, null, 2);

  await fs.writeFile(JSON_PATH, data, "utf8", (err) => {
    if (err) {
      logger.error(`Error in write_json_file: ${err}`, { module });
      return;
    }
    logger.success(`Data successfully written to file: ${JSON_PATH}`, { module });
  });
};

const process_return_json = async () => {
  try {
    const data = await fs.readFile(JSON_PATH, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (err) {
    logger.error(`Error in read_json_file: ${err}`, { module });
    throw err;
  }
};

export {
  process_return_json,
  process_write_json,
};
