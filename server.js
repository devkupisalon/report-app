import express from "express";
import logger from "./logs/logger.js";
import { get_data_all, save_report } from "./utils/google/sheets.js";

const module = import.meta.filename;

const app = express();
app.use(express.json()); 

/** ERRORS */
app.use((error, req, res, next) => {
    logger.error(`An error occurred: ${error.message}`, { module });
    res.status(500).send(error);
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

/** get ALL data */
app.get("/get-all-data", async (req, res) => {
    try {
        const data = await get_data_all();
        logger.info(`Data recieved successfully`, { module });
        return res.json({ data });
    } catch (error) {
        logger.error(`An error occurred in get_cars: ${error.message}`, { module });
        return res.status(500).json({ error: error.toString() });
    }
});

/** Save user data to spreadsheet */
app.post("/savedata", async (req, res) => {
    try {
        const requestData = req.body;
        if (!requestData || !requestData.data) {
            throw new Error('Data was not passed correctly.');
        }
        logger.info(`Data successfully received from mini-app`, { module });
        const success = await save_report(requestData.data);
        return res.json({ success });
    } catch (error) {
        logger.error(`An error occurred in save_data: ${error.message}`, { module });
        return res.status(500).json({ error: error.toString() });
    }
});

/** server init */
app.listen("8000", "localhost", (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info("Server is running on port 8000", { module });
});


// path to get download link from yandex disk
// https://cloud-api.yandex.net/v1/disk/resources/download?path=disk%3A%2F%D0%9A%D1%83%D0%BF%D0%B8%20%D1%81%D0%B0%D0%BB%D0%BE%D0%BD%2F%D0%97%D0%B0%D0%BF%D0%B8%D1%81%D0%B8%20%D0%B7%D0%B2%D0%BE%D0%BD%D0%BA%D0%BE%D0%B2%2F25-09-2023-15%3A16%3A01-79623279352-%D0%93%D0%B2%D0%B0%D1%81%D0%B0%D0%BB%D0%B8%D1%8F%20%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%BE%D0%B7
// disk:/Купи салон/Записи звонков/25-09-2023-15:16:01-79623279352-Гвасалия Николоз
