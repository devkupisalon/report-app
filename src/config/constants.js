import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const __dirname = import.meta.dirname;
const ROOT = path.parse(__dirname).base;
const APP = 'REPORT_APP';

const constants = {
  // ...Object.keys(process.env).reduce((acc, key) => {
  //   acc[key] = process.env[key];
  //   return acc;
  // }, {}),
  ...process.env,
  IMAGE_LINK: id => `https://lh3.googleusercontent.com/d/${id}=w2000`,
  VIDEO_LINK: id => `https://drive.google.com/file/d/${id}/preview`,
  JSON_PATH: `${__dirname}/json/ids_to_delete.json`,
  parse_mode: "Markdown",
};

const middleware = {
  true: `ВЫПОЛНЕН ✅`,
  false: `НЕ ВЫПОЛНЕН ❌`
};

export { constants, __dirname, ROOT, APP, middleware };
