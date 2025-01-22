require("dotenv").config();
const tracker = require("./tracker");
const bot = require("./bot");

(async () => {
  console.log("Запуск селф-бота...");
  await tracker(); // Парсинг канала-источника
  bot();           // Логика команд владельца
})();
