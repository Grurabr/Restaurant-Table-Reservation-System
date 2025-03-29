// addReminderSentColumn.js
const {pool} = require('../config/db');

async function addReminderSentColumn() {
  try {
    // Попытка добавить колонку reminder_sent типа TINYINT с значением по умолчанию 0
    const sql = `
      ALTER TABLE reservation
      ADD COLUMN reminder_sent TINYINT DEFAULT 0;
    `;
    await pool.execute(sql);
    console.log("Column 'reminder_sent' added successfully.");
  } catch (error) {
    // Если колонка уже существует или произошла другая ошибка, выводим сообщение
    console.error("Error adding column 'reminder_sent':", error);
  }
}

addReminderSentColumn();
