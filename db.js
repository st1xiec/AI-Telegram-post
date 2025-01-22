const Database = require("better-sqlite3");

const db = new Database("./data.sqlite");

db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  channel_id TEXT,
  message_id INTEGER,
  content TEXT,
  rephrased_content TEXT,
  status TEXT,
  media BLOB
);
`);

function insertPost(channelId, messageId, content, rephrasedContent, status, media) {
  const stmt = db.prepare(
    `INSERT INTO posts (channel_id, message_id, content, rephrased_content, status, media) VALUES (?, ?, ?, ?, ?, ?)`
  );
  stmt.run(channelId, messageId, content, rephrasedContent, status, media);
}

function getPostByMessageId(channelId, messageId) {
  const stmt = db.prepare(`SELECT * FROM posts WHERE channel_id = ? AND message_id = ?`);
  return stmt.get(channelId, messageId);
}

function getDraftPosts() {
  const stmt = db.prepare(`SELECT * FROM posts WHERE status = 'draft'`);
  return stmt.all();
}

function updatePostStatus(id, status) {
  const stmt = db.prepare(`UPDATE posts SET status = ? WHERE id = ?`);
  stmt.run(status, id);
}

module.exports = { insertPost, getPostByMessageId, getDraftPosts, updatePostStatus };
