const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { getDraftPosts, updatePostStatus, deletePost } = require("./db");
const input = require("input");

const apiId = parseInt(process.env.API_ID); // Telegram API ID
const apiHash = process.env.API_HASH;      // Telegram API Hash
const sessionFile = process.env.SESSION_FILE || "./session.sqlite"; // Сохранённая сессия
const OWNER_ID = parseInt(process.env.OWNER_ID); // Telegram ID владельца

function bot() {
  // Загружаем сессию из файла, если она существует
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

  client.start({
    phoneNumber: async () => await input.text("Введите ваш номер телефона: "),
    password: async () => await input.text("Введите пароль (если есть): "),
    phoneCode: async () => await input.text("Введите код подтверждения: "),
    onError: (err) => console.error("Ошибка авторизации:", err),
  }).then(() => {
    console.log("Бот для владельца запущен!");

    // Сохраняем сессию в файл после успешного запуска
    const savedSession = client.session.save();
    fs.writeFileSync(sessionFile, savedSession, "utf8");
    console.log("Сессия сохранена в файл:", sessionFile);
  });

  // Обработка сообщений
  client.addEventHandler(async (event) => {
    try {
      const message = event.message;

      // Проверяем, что сообщение пришло от владельца
      if (!message || message.senderId !== OWNER_ID) return;

      // Парсим команду и аргументы
      const text = message.message || "";
      const [command, ...args] = text.split(" ");

      switch (command) {
        case "/drafts":
          await handleDraftsCommand(client, message);
          break;

        case "/approve":
          await handleApproveCommand(client, message, args);
          break;

        case "/reject":
          await handleRejectCommand(client, message, args);
          break;

        default:
          console.log("Неизвестная команда:", command);
      }
    } catch (error) {
      console.error("Ошибка обработки команды:", error.message);
    }
  });

  console.log("Готов к обработке команд владельца!");
}

// Обработка команды "/drafts"
async function handleDraftsCommand(client, message) {
  const drafts = getDraftPosts();
  if (!drafts.length) {
    await client.sendMessage(message.senderId, {
      message: "Нет черновиков.",
    });
    return;
  }

  for (const draft of drafts) {
    await client.sendMessage(message.senderId, {
      message: `ID: ${draft.id}\nТекст: ${draft.rephrased_content}\nСтатус: ${draft.status}`,
    });
  }
}

// Обработка команды "/approve"
async function handleApproveCommand(client, message, args) {
  const postId = parseInt(args[0], 10);
  if (!postId) {
    await client.sendMessage(message.senderId, {
      message: "Пожалуйста, укажите ID поста: /approve <id>",
    });
    return;
  }

  const post = getDraftPosts().find((draft) => draft.id === postId);
  if (!post) {
    await client.sendMessage(message.senderId, {
      message: `Пост с ID ${postId} не найден.`,
    });
    return;
  }

  // Публикуем пост в целевом канале
  await client.sendMessage(process.env.TARGET_CHANNEL, {
    message: post.rephrased_content,
  });

  // Обновляем статус поста
  updatePostStatus(postId, "published");

  await client.sendMessage(message.senderId, {
    message: `Пост опубликован: ID ${postId}`,
  });
}

// Обработка команды "/reject"
async function handleRejectCommand(client, message, args) {
  const postId = parseInt(args[0], 10);
  if (!postId) {
    await client.sendMessage(message.senderId, {
      message: "Пожалуйста, укажите ID поста: /reject <id>",
    });
    return;
  }

  const post = getDraftPosts().find((draft) => draft.id === postId);
  if (!post) {
    await client.sendMessage(message.senderId, {
      message: `Пост с ID ${postId} не найден.`,
    });
    return;
  }

  // Удаляем пост из базы данных
  deletePost(postId);

  await client.sendMessage(message.senderId, {
    message: `Пост отклонён: ID ${postId}`,
  });
}

module.exports = bot;
