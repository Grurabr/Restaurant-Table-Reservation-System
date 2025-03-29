// reminder_emailService.js
const { pool } = require('../config/db');
const moment = require('moment-timezone');
const { encrypt, decrypt } = require('../utils/crypto');

/**
 * Retrieves reservations that start exactly 48 hours from now with a ±5-minute window.
 * Only confirmed bookings are included, and reminders must not have been sent yet.
 * Uses the 'Europe/Helsinki' timezone.
 */
async function getUpcomingBookings() {
  console.log('Executing query for upcoming bookings...');
  const now = moment.tz('Europe/Helsinki');
  const target = now.clone().add(48, 'hours');
  const windowStart = target.clone().subtract(5, 'minutes');
  const windowEnd = target.clone().add(5, 'minutes');
  const windowStartStr = windowStart.format('YYYY-MM-DD HH:mm:ss');
  const windowEndStr = windowEnd.format('YYYY-MM-DD HH:mm:ss');

  const sql = `
    SELECT r.*, u.email, u.first_name, u.last_name
    FROM reservation r
    JOIN Users u ON r.id_user = u.id_user
    WHERE booking_start BETWEEN ? AND ?
      AND confirmation = 1
      AND (reminder_sent IS NULL OR reminder_sent = 0)
  `;

  try {
    const [rows] = await pool.execute(sql, [windowStartStr, windowEndStr]);
    return rows.map(row => ({
      ...row,
      email: decrypt(row.email),
      first_name: decrypt(row.first_name),
      last_name: decrypt(row.last_name),
    }));
  } catch (error) {
    console.error('Error querying upcoming bookings:', error);
    return [];
  }
}

/**
 * Updates the reservation record, marking that the reminder has been sent.
 */
async function markReminderSent(id_reservation) {
  try {
    await pool.execute('UPDATE reservation SET reminder_sent = 1 WHERE id_reservation = ?', [id_reservation]);
  } catch (error) {
    console.error(`Error updating reminder_sent for reservation ${id_reservation}:`, error);
  }
}

module.exports = { getUpcomingBookings, markReminderSent };
