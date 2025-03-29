const { pool } = require("../config/db.js");
const { encrypt, decrypt } = require('../utils/crypto');

const sendQuery = async (success_message, query) => {
  try {
    await pool.query(query);
    console.log(success_message);
  } catch (error) {
    if (error.errno == 1060)
      console.log(`Password column already exists!`);
    else
      console.log(`Query error`, error);
  }
};

// Encrypt and update user data in a transaction
const encryptAndUpdateUsers = async () => {
  const [users] = await pool.query('SELECT * FROM users');
  const connection = await pool.getConnection();

  try {
      await connection.beginTransaction();
      for (const user of users) {
          if (user.phone.length > 15) continue;
          const query = `UPDATE Users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id_user = ?`;
          const values = [
              encrypt(user.first_name),
              encrypt(user.last_name),
              encrypt(user.email),
              encrypt(user.phone),
              user.id_user
          ];
          await connection.execute(query, values);
      }
      await connection.commit();
      return { success: true, message: "Users updated successfully" };
  } catch (error) {
      await connection.rollback();
      return { success: false, message: "Error updating users", error };
  } finally {
      connection.release();
  }
};


const changeDB = async () => {
  try {
    console.log("All changes were made successfully!!");
    //encryptAndUpdateUsers();
  } catch (error) {
    console.log("Error changing database", error);
    throw error;
  }
};

module.exports = changeDB;
