import path from 'path';
import winston from 'winston';
import { __dirname, ROOT, APP } from './constants.js';

const { createLogger, transports, format } = winston;
const logFilePath = path.join(__dirname, 'app.log');
let module;

const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        success: 5,
    },
    colors: {
        fatal: 'brightRed',
        error: 'lightRed',
        warn: 'cyan',
        info: 'yellow',
        debug: 'blue',
        success: 'brightGreen'
    }
};

const logger = createLogger({
    levels: logLevels.levels,
    level: 'success',
    exitOnError: false,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.printf(({ level, message, timestamp }) => {
            const formattedLevel = level.toUpperCase().padEnd(7);
            const regex = new RegExp(`${ROOT}\/(.*?)(?=\.(js|ts|$))`);
            module = process.argv[1].match(regex)[1].replace(/\//, '.');
            return `${timestamp.replace(/[TZ]/g, ' ').trim().slice(0, -4)} | ${APP} | ${formattedLevel} | ${module} | ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: logFilePath })
    ]
});

winston.addColors(logLevels.colors);

export default logger;
export const set_module = (file) => {
    const regex = new RegExp(`${ROOT}\/(.*?)(?=\.(js|ts|$))`);
    module = file.match(regex)[1].replace(/\//, '.');
};