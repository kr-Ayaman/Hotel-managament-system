const bcrypt = require('bcrypt');
const crypto = require('crypto');
const HttpError = require('../models/http-error')
const nodemailer = require('nodemailer');
const pool = require('../models/db'); 

async function registerUser({ first_name, last_name, email, phone_number, password, address }) {
  try {
    const emailUser = 'achotels42@gmail.com';
    const emailPass = 'omcwkcsuwejaywuu';
    const hashedPassword = password && password.trim().length > 0 
    ? await bcrypt.hash(password, 12) 
    : null;
    const otp = crypto.randomInt(100000, 999999);
    await pool.query(
      `INSERT INTO pending_verifications (first_name, last_name, email, phone_number, passwords, address, otp) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE otp = ?, passwords = ?, first_name = ?, last_name = ?, phone_number = ?, address = ?`,
      [first_name, last_name, email, phone_number, hashedPassword, address, otp, otp, hashedPassword, first_name, last_name, phone_number, address]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP code is ${otp}. Please enter this code to verify your email.`,
    };

    await transporter.sendMail(mailOptions);
    return 'User registered and OTP sent' ;
  } catch (error) {
    throw new HttpError('Failed to register user', 500);
  }
}

module.exports = {registerUser};
