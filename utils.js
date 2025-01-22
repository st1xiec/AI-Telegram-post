/**
 * Отправляет уведомление владельцу о новом посте.
 * @param {TelegramClient} client Telegram клиент
 * @param {number} ownerId ID владельца
 * @param {number} messageId ID сообщения
 * @param {string} text Уникальный текст поста
 * @param {object} media Медиафайл (если есть)
 */
async function notifyOwnerWithButtons(client, ownerId, messageId, text, media) {
    try {
      const message = `⚡ <b>Новый пост для проверки</b>\n\n<b>ID:</b> ${messageId}\n<b>Текст:</b>\n${text}\n\n` +
        `Выберите действие:`;
  
      const buttons = [
        [
          { text: "✅ Одобрить", callback_data: `/approve ${messageId}` },
          { text: "❌ Отклонить", callback_data: `/reject ${messageId}` },
        ],
        [{ text: "✏️ Редактировать", callback_data: `/edit ${messageId}` }],
      ];
  
      // Отправляем текст владельцу
      await client.sendMessage(ownerId, {
        message,
        parseMode: "html",
        replyMarkup: {
          inlineKeyboard: buttons,
        },
      });
  
      // Отправляем изображение (если есть)
      if (media) {
        await client.sendFile(ownerId, {
          file: media,
          caption: "Приложенное изображение.",
        });
      }
    } catch (error) {
      console.error("Ошибка при отправке уведомления владельцу:", error.message);
    }
  }
  
  module.exports = { notifyOwnerWithButtons };
  