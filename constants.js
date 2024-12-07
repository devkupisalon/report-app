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
  IMAGE_LINK: id => `https://lh3.googleusercontent.com/d/${id}=w2000`
};

export { constants, __dirname, ROOT, APP };
