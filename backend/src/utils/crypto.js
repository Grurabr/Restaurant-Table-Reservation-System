const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.ENCRYPTION_IV;

// Encrypt
function encrypt(text) {
    if (!text) return null;
    const iv = Buffer.from(IV, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Decrypt
function decrypt(encryptedText) {
    if (!encryptedText) return null;
    const iv = Buffer.from(IV, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

module.exports = {encrypt, decrypt};