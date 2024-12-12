import { constants } from '#config';
import TelegramBot from 'node-telegram-bot-api';

const { BOT_TOKEN } = constants;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

export default bot;