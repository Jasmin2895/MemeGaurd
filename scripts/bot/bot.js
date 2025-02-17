require("dotenv").config();

const { Telegraf } = require("telegraf");
const { handleMemeCommand } = require("./memeHandler");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.command("meme", handleMemeCommand);
bot.launch();
