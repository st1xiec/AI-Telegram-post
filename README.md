AI Telegram Self-Bot для обработки постов
Этот проект представляет собой Telegram селф-бота, который предназначен для мониторинга исходного канала, обработки постов через OpenAI GPT (например, gpt-3.5-turbo или gpt-4) и отправки их в целевой канал после утверждения владельцем. Бот упрощает управление контентом, предоставляя возможность редактировать и модерировать посты перед публикацией.

Возможности
Мониторинг канала-источника: Автоматически отслеживает новые посты в указанных исходных каналах.
Обработка контента через OpenAI: Создаёт уникальный текст на основе исходного поста, используя GPT.
Система утверждения: Отправляет переработанный текст владельцу бота в личные сообщения для утверждения, редактирования или отклонения.
Публикация в целевой канал: Автоматически публикует одобренные посты в заданный канал, включая текст и изображения (если есть).
Обработка ошибок: Устойчивость к ошибкам API OpenAI, с повторными попытками при необходимости.
База данных SQLite: Используется для предотвращения дублирования постов и хранения истории обработанных сообщений.
Команды владельца: Возможность вручную модерировать посты через команды, такие как /approve, /reject, /edit.
Установка
Требования
Node.js (версия 16 или выше)
Действующий ключ API OpenAI
Данные Telegram API (API ID и API Hash)
Шаги установки
Клонируйте репозиторий:

bash
Копировать
git clone https://github.com/st1xiec/AI-Telegram-post.git
cd AI-Telegram-post
Установите зависимости:

bash
Копировать
npm install
Создайте файл .env в корневой папке проекта и добавьте следующие переменные окружения:

plaintext
Копировать
API_ID=ваш_telegram_api_id
API_HASH=ваш_telegram_api_hash
OPENAI_API_KEY=ваш_openai_api_key
SOURCE_CHANNELS=@username_канала_источника
TARGET_CHANNEL=@username_целевого_канала
DATABASE_PATH=./data.sqlite
SESSION_FILE=./session.sqlite
OWNER_ID=ваш_telegram_user_id
AUTO_APPROVE=false
Инициализируйте базу данных:

bash
Копировать
node db.js
Использование
Запуск бота
Для запуска выполните команду:

bash
Копировать
node index.js
Основные команды
/approve: Утверждает все ожидающие публикации посты и отправляет их в целевой канал.
/reject: Отклоняет посты в статусе ожидания.
/edit: Позволяет вручную редактировать текст перед публикацией.
Структура проекта
Файлы и папки проекта:

bash
Копировать
.
├── .env                # Переменные окружения
├── ai.js               # Работа с OpenAI GPT
├── bot.js              # Логика Telegram селф-бота
├── db.js               # Управление базой данных SQLite
├── index.js            # Точка входа в приложение
├── tracker.js          # Отслеживание канала-источника
├── utils.js            # Вспомогательные функции
├── data.sqlite         # База данных SQLite
└── session.sqlite      # Сохранённая сессия Telegram
Возможные ошибки и их решения
Частые ошибки
"Your API ID or Hash cannot be empty or undefined":

Убедитесь, что в .env указаны корректные API_ID и API_HASH.
"429 Too Many Requests":

Вы превысили лимит запросов OpenAI. Проверьте лимит в панели управления OpenAI.
"Configuration is not a constructor":

Убедитесь, что используется последняя версия библиотеки openai (4.x.x) и код обновлён для работы с этой версией.
Логи
Для включения детальных логов отредактируйте настройки отладки в коде (например, через DEBUG).

Участие
Если вы хотите внести вклад в проект, создавайте форки и отправляйте pull request. Все идеи и улучшения приветствуются!

Лицензия
Проект распространяется под лицензией MIT. Подробнее см. в файле LICENSE.
