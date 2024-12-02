import express from "express";
import logger from "./logs/logger.js";
import { get_all_data } from "./utils/sheets.js";

const app = express();

/** ERRORS */
app.use((error, req, res, next) => {
    logger.error(`An error occurred: ${error.message}`);
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
        const data = await get_all_data();
        logger.info(`Data recieved successfully`);

        return res.json({ data });
    } catch (error) {
        logger.error(`An error occurred in get_cars: ${error.message}`);
        return res.status(500).json({ error: error.toString() });
    }
});

/** Save user data to spreadsheet */
app.get("/savedata", async (req, res) => {
    try {
        logger.info(`Data successfully received from mini-app`);
        const success = await save(req.query);
        return res.json({ success });
    } catch (error) {
        logger.error(`An error occurred in save_data: ${error.message}`);
        return res.status(500).json({ error: error.toString() });
    }
});

/** server init */
app.listen("8000", "localhost", (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info("Server is running on port 8000");
});
