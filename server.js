import logger from '#logger';
import express from "express";
import cron from 'node-cron';

import { send_web_app_link_to_user } from '#process_messages';
import { get_data_for_web_app } from "#main";
import { save_report } from "#sheets";

const module = import.meta.filename;

const app = express();
app.use(express.json());
let data;

app.use((error, req, res, next) => {
    logger.error(`An error occurred: ${error.message}`, { module });
    res.status(500).send(error);
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get("/get-all-data", async (req, res) => {
    try {
        logger.info(`Data recieved successfully`, { module });
        return res.json({ data });
    } catch (error) {
        logger.error(`An error occurred in get_cars: ${error.message}`, { module });
        return res.status(500).json({ error: error.toString() });
    }
});

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

app.listen("8000", "31.129.109.210", async (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info("Server is running on port 8000", { module });
    data = await get_data_for_web_app();
    if (Object.keys(data) > 0) {
        logger.success(`All content received successfully`, { module });
    }
    // await send_web_app_link_to_user();
});

// cron.schedule('0 0 * * *', async () => {
//     data = await data_for_web_app();
//     logger.info('The cron job has been successfully executed');
// });

// cron.schedule('0 6 * * *', async () => {
//     await send_web_app_link_to_user();
//     logger.info('The cron job has been successfully executed');
// });