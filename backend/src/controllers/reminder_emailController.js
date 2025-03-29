// reminder_emailController.js
const transporter = require('../config/nodemailer');
const { getUpcomingBookings, markReminderSent } = require('../services/reminder_emailService');
const cron = require('node-cron');

console.log('Reminder Email Controller loaded');

/**
 * Sending email reminders to the client 48 hours in advance
 */
async function sendReminderEmail(reservation) {
    console.log('Updated sendReminderEmail invoked')
  // Format date in finnish format without seconds
  const formattedDate = new Date(reservation.booking_start).toLocaleString('fi-FI', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  const mailOptions = {
    from: `"Restaurant Reservations" <dev.web.test.3@gmail.com>`,
    to: reservation.email,
    subject: 'Reminder: Your booking is in 48 hours!',
    html: `<p>Hello, ${reservation.first_name} ${reservation.last_name}!</p>
           <p>This is a friendly reminder that your booking  with the booking ID: <strong>${reservation.id_reservation}</strong>  is scheduled for:</p>
           <p><strong>Date and time:</strong> ${formattedDate}</p>
           <p><strong>Number of guests:</strong> ${reservation.number_of_guests}</p>
           <p><strong>Table number:</strong> ${reservation.id_table}</p>
           <p>We look forward to seeing you!</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${reservation.email}, messageId: ${info.messageId}`);
    // After successful sending, the entry in the database is updated via the service
    await markReminderSent(reservation.id_reservation);
  } catch (error) {
    console.error(`Error sending reminder email to ${reservation.email}:`, error);
  }
}

/**
 * Получает все бронирования, начинающиеся через 48 часов, и отправляет уведомления.
 */
async function processReminders() {
  console.log('processReminders() started at', new Date());
  const bookings = await getUpcomingBookings();
  console.log('Found bookings:', bookings);
  if (bookings.length === 0) {
    console.log('No upcoming bookings for 48 hours later.');
    return;
  }
  for (const booking of bookings) {
    await sendReminderEmail(booking);
  }
}
// Функция-обёртка для использования в маршрутах (при ручном вызове)
async function processRemindersRoute(req, res) {
    try {
      await processReminders();
      res.status(200).json({ message: 'Reminder process triggered successfully' });
    } catch (error) {
      console.error('Error triggering reminder process:', error);
      res.status(500).json({ error: 'Failed to trigger reminder process' });
    }
  }
// Планирование задачи, которая запускается каждую минуту
cron.schedule('* * * * *', () => {
  console.log('Checking for upcoming bookings at', new Date());
  processReminders();
});

module.exports = {
  sendReminderEmail,
  processReminders,
  processRemindersRoute
};
