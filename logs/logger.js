import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { __dirname, ROOT, APP } from '../constants.js';

const { createLogger, transports, format } = winston;

const logs_path = path.join(__dirname, 'logs');
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

const default_format = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss', tz: 'UTC+3' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, module, message }) => {
        console.log(module);
        const formattedLevel = level.toUpperCase().padEnd(7);
        let module_file = module.match(regex)[1];
        module_file = module_file.includes('/') ? module_file.replaceAll(/\//g, '.') : module_file;
        return `${timestamp} | ${process.pid} | ${APP} | ${formattedLevel} | ${module_file} | ${message}`;
    })
);

// const daily_transports = new DailyRotateFile({
//     filename: '%DATE%_app.log',
//     format: default_format,
//     datePattern: 'YYYY-MM-DD-HH',
//     maxSize: '10m',
//     dirname: logs_path,
//     maxFiles: '7d',
// });

winston.addColors(logLevels.colors);

const logger = createLogger({
    levels: logLevels.levels,
    level: 'debug',
    exitOnError: false,
    format: default_format,
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
        // daily_transports
    ],
    exceptionHandlers: [
        new transports.File({ filename: exceptions_log_path })
    ]
});

export default logger;