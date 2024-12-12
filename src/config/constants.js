import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const __dirname = import.meta.dirname;
const ROOT = path.parse(__dirname).base;
const APP = 'REPORT_APP';

const constants = {
  ...Object.keys(process.env).reduce((acc, key) => {
    acc[key] = process.env[key];
    return acc;
  }, {}),
  // ...process.env,
  IMAGE_LINK: id => `https://lh3.googleusercontent.com/d/${id}=w2000`,
  VIDEO_LINK: id => `https://drive.google.com/file/d/${id}/preview`,
  GOOGLE_DOC_LINK: id=> `https://docs.google.com/document/d/${id}/edit`,
  JSON_PATH: `${__dirname}/json/ids_to_delete.json`,
  parse_mode: "Markdown",
  short: 30,
  long: 60
};

const check_map = {
  true: `ВЫПОЛНЕН ✅`,
  false: `НЕ ВЫПОЛНЕН ❌`
};

export { constants, __dirname, ROOT, APP, check_map };
