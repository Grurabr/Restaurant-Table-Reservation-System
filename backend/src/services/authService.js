const {pool} = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');

// Register user
const registerUser = async (user) => {
    try {
        // Create new user
        const query=`INSERT INTO Users (first_name, last_name, phone, email, role) VALUES (?, ?, ?, ?, ?)`;
        const values = [
            encrypt(user.first_name), 
            encrypt(user.last_name), 
            encrypt(user.phone), 
            encrypt(user.email), 
            'client'
        ];
        console.log("values", values)// role == "client"

        const responce = await pool.execute(query, values);

        return {success:true, message:"User successfully registered", id: responce[0].insertId};

    } catch(error) {
        let message = "Error inserting data";
        if (error.errno == 1062){ message = "A user with such an email or Phone already exists" }
        return {success:false, message:message, error:error};
    }
}

// Get user role
const getUserRole = async (email) => {
    try {
        console.log(encrypt(email));
        // Find user
        const [result] = await pool.execute(`SELECT role FROM Users WHERE email = ?`, [encrypt(email)]);

        if (result.length === 0) { return {success:false, message:"User not found"}}

        return {success:true, message:"Login successfully", role: result[0].role };
    } catch (error) {
        return {success:false, message:"Error fetching user role", error:error};
    }
}

// Get user params
const getUserParams = async (email) => {
    try {
        // Find user
        const [result] = await pool.execute(`SELECT id_user, first_name, last_name, phone, role FROM Users WHERE email = ?`, [encrypt(email)]);

        if (result.length === 0) { return {success:false, message:"User not found"}}

        return {
            success:true, 
            message:"Login successfully",
            id_user: result[0].id_user,
            first_name: decrypt(result[0].first_name),
            last_name: decrypt(result[0].last_name),
            phone: decrypt(result[0].phone),
            role: result[0].role
        };

    } catch (error) {
        return {success:false, message:"Error fetching user params", error:error};
    }
}

module.exports = {registerUser, getUserRole, getUserParams};