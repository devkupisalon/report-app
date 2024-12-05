import path from 'path';
import winston from 'winston';
import { __dirname, ROOT, APP } from '../constants.js';

const { createLogger, transports, format } = winston;

const default_log_path = path.join(__dirname, 'logs', 'app.log');
const exceptions_log_path = path.join(__dirname, 'logs', 'exceptions.log');
const json_log_path = path.join(__dirname, 'logs', 'json.log');

const regex = new RegExp(`${ROOT}\/(.*?)(?=\.(js|$))`);

const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        success: 3,
        info: 4,
        debug: 5,
    },
    colors: {
        fatal: 'brightRed',
        error: 'lightRed',
        warn: 'cyan',
        success: 'brightGreen',
        info: 'yellow',
        debug: 'blue',
    }
};

winston.addColors(logLevels.colors);

const logger = createLogger({
    levels: logLevels.levels,
    level: 'debug',
    exitOnError: false,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss', tz: 'UTC+3' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, module, message }) => {
            const formattedLevel = level.toUpperCase().padEnd(7);
            let module_file = module.match(regex)[1];
            module_file = module_file.includes('/') ? module_file.replaceAll(/\//g, '.') : module_file;
            return `${timestamp} | ${process.pid} | ${APP} | ${formattedLevel} | ${module_file} | ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: default_log_path,
            handleRejections: true
        }),
        new transports.File({
            filename: json_log_path,
            format: format.json()
        }),

    ],
    exceptionHandlers: [
        new transports.File({ filename: exceptions_log_path })
    ]
});

export default logger;