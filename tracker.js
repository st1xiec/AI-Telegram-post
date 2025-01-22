const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { insertPost, getPostByMessageId, logEvent } = require("./db");
const { rephraseText } = require("./ai");
const { notifyOwnerWithButtons } = require("./utils");
const input = require("input");

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const sessionFile = process.env.SESSION_FILE || "./session.sqlite";
const OWNER_ID = parseInt(process.env.OWNER_ID); // ID владельца
const SOURCE_CHANNELS = process.env.SOURCE_CHANNELS.split(",");

let sessionString = "";
if (fs.existsSync(sessionFile)) {
  sessionString = fs.readFileSync(sessionFile, "utf8");
  console.log("Загружена сессия из файла:", sessionFile);
} else {
  console.log("Файл сессии не найден. Будет создан новый.");
}

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});

async function tracker() {
  console.log("Запуск Telegram клиента...");

  // Авторизация клиента
  await client.start({
    phoneNumber: async () => await input.text("Введите ваш номер телефона: "),
    password: async () => await input.text("Введите пароль (если есть): "),
    phoneCode: async () => await input.text("Введите код подтверждения: "),
    onError: (err) => console.error("Ошибка авторизации:", err),
  });

  console.log("Клиент успешно подключён!");
  fs.writeFileSync(sessionFile, client.session.save(), "utf8");

  const channels = [];
  for (const source of SOURCE_CHANNELS) {
    try {
      const channel = await client.getEntity(source.trim());
      channels.push(channel);
      console.log(`Подключён к каналу-источнику: @${source}`);
    } catch (error) {
      console.error(`Ошибка подключения к каналу @${source}:`, error.message);
    }
  }

  client.addEventHandler(async (update) => {
    try {
      if (!update.message || !update.message.peerId) {
        console.log("[DEBUG] Это не сообщение или сообщение не содержит peerId.");
        return;
      }

      const peerId = update.message.peerId;
      if (!peerId.channelId) {
        console.log("[DEBUG] Сообщение не из канала.");
        return;
      }

      const channelId = peerId.channelId.toString();
      const channel = channels.find((ch) => ch.id.toString() === channelId);

      if (!channel) {
        console.log(`[DEBUG] Сообщение из другого канала (channelId: ${channelId}).`);
        return;
      }

      const messageId = update.message.id;
      const text = update.message.message || "";
      const media = update.message.media || null;

      console.log(`[DEBUG] Новое сообщение из канала @${channel.username}: ID ${messageId}`);

      // Проверяем, обработано ли сообщение ранее
      const existingPost = getPostByMessageId(channel.username, messageId);
      if (existingPost) {
        console.log(`[DEBUG] Сообщение ${messageId} уже обработано.`);
        return;
      }

      // Обработка текста
      if (text) {
        console.log("[DEBUG] Отправляем текст на GPT для обработки...");
        const rephrasedText = await rephraseText(text);
        if (!rephrasedText) {
          console.error("[ERROR] Ошибка при обработке текста через GPT.");
          return;
        }

        // Сохраняем сообщение в базу данных
        insertPost(channel.username, messageId, text, rephrasedText, "draft", media);
        console.log(`[INFO] Текст сообщения ${messageId} добавлен в черновики.`);

        // Уведомляем владельца
        await notifyOwnerWithButtons(client, OWNER_ID, messageId, rephrasedText, media);
      } else {
        console.log(`[DEBUG] Сообщение ${messageId} не содержит текста.`);
      }

    } catch (error) {
      console.error("[ERROR] Ошибка обработки сообщения:", error.message);
    }
  });

  console.log(`Селф-бот отслеживает каналы: ${SOURCE_CHANNELS.join(", ")}`);
}

module.exports = tracker;