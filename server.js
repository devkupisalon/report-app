import { get_previous_workday_and_weekend_info } from '#common/helper';
import logger from '#logger';
import { get_data_for_web_app } from "#main";
import { send_web_app_link_to_user } from '#process_messages';
import { save_report } from "#sheets";
import express from "express";
import cron from 'node-cron';

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
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get("/get-all-data", async (req, res) => {
    try {
        logger.info(`Data recieved successfully`, { module });
        if (data && Object.keys(data) > 0) {
            return res.json({ data });
        } else {
            logger.debug(`Data is not available in this moment...`, { module });
            return res.json({ data: false });
        }
    } catch (error) {
        logger.error(`An error occurred: ${error.message}`, { module });
        return res.status(500).json({ error: error.toString() });
    }
});

app.post("/save-data", async (req, res) => {
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

app.listen("8000", "127.0.0.1", async (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info("Server is running on port 8000", { module });
    // data = await get_data_for_web_app();
});

cron.schedule('10 11 * * *', async () => {
    const { is_weekend } = get_previous_workday_and_weekend_info();
    if (is_weekend) {
        data = await get_data_for_web_app();
        logger.info('The cron job has been successfully executed');

        setTimeout(async () => {
            await send_web_app_link_to_user();
        }, 10 * 6 * 1000 /* 6 * 60 * 60 * 1000 */);
    } else {
        logger.info('Today is the weekend, no need to check content', { module });
    }
});

// cron.schedule('0 6 * * *', async () => {
//     const { is_weekend } = get_previous_workday_and_weekend_info();
//     if (is_weekend) {
//         await send_web_app_link_to_user();
//         logger.info('The cron job has been successfully executed');
//     } else {
//         logger.info(`Today is the weekend, no need to check content`, { module });
//     }
// });