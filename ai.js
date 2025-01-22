const { OpenAI } = require("openai");


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

/**
 * Переформулирует текст через OpenAI.
 * @param {string} text - Исходный текст.
 * @param {number} retryCount - Количество попыток (по умолчанию 3).
 * @returns {Promise<string|null>} - Переформулированный текст или null в случае ошибки.
 */
async function rephraseText(text, retryCount = 3) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`[INFO] GPT: отправляем запрос. Попытка ${attempt}`);

      // GPT-запрос
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: "Ты - эксперт в написании уникальных текстов. Переформулируй предоставленный текст, добавляя авторское мнение и делая его уникальным.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 500,
        temperature: 0.7, // Уровень креативности
      });

      // Извлекаем результат из ответа API
      const rephrasedText = response.choices[0].message.content.trim();
      console.log("[INFO] GPT: текст успешно обработан.");
      return rephrasedText;
    } catch (error) {
      console.error(`[ERROR] Ошибка при работе с OpenAI API (попытка ${attempt}):`, error.message);

      // Если ошибка связана с лимитом запросов
      if (error.status === 429 && attempt < retryCount) {
        console.log("[INFO] Превышен лимит запросов. Ожидание перед повторной попыткой...");
        await sleep(3000); // Ждём 3 секунды
      } else if (error.status >= 500 && attempt < retryCount) {
        console.log("[INFO] Ошибка сервера OpenAI. Повторная попытка...");
        await sleep(2000); // Ждём 2 секунды
      } else {
        console.error("[ERROR] Не удалось обработать текст через GPT.");
        break;
      }
    }
  }

  return null; // Если все попытки завершились неудачей, возвращаем null
}

/**
 * Функция для ожидания (паузы).
 * @param {number} ms - Время ожидания в миллисекундах.
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { rephraseText };