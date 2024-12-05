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
  }, {})
};

export { constants, __dirname, ROOT, APP };
