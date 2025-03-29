const UserModel = require("../models/userModel");
const { registerUser, getUserRole, getUserParams } = require("../services/authService");

// Register user
const register = async(req, res) => {
    const { firstname, lastname, phone, email } = req.body;

    if (phone.length > 15) {
        return res.status(400).send("Phone number cannot exceed 15 characters");
    }

    const user = new UserModel({ firstname, lastname, email, phone});

    try {
        const response = await registerUser(user);
        if(response.success) {
            return res.status(200).send("New record inserted");
        } else {
            return res.status(400).json(response);
        }
    } catch (err) {
        console.error("Error inserting data: ", err);
        return res.status(500).json({error: "Error inserting data"});
    }    

}

// Get user Role
const getRole = async(req, res) => {
    const { email } = req.body;

    try {
        const response = await getUserRole(email);
        if(response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (err) {
        console.error("Error fetching user role:", err);
        return res.status(500).json({error: "Error fetching user role"});
    }    
}

// Get user params
const getUser = async(req, res) => {
    const { email } = req.body;

    try {
        const response = await getUserParams(email);
        if(response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (err) {
        console.error("Error fetching user params:", err);
        return res.status(500).json({error: "Error fetching user params"});
    }    
    
}

module.exports = {register, getRole, getUser};