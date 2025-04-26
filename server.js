// var http = require('http');
// var server = http.createServer(function(req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     var message = 'It works!\n',
//         version = 'NodeJS ' + process.versions.node + '\n',
//         response = [message, version].join('\n');
//     res.end(response);
// });
// server.listen();

require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
// import { BASE_URL } from './config';

const app = express();
app.use(express.json());

const BASE_URL = "https://daily-checkup.niloyrudra.com";

const otpStore = new Map(); // Temporary in-memory storage

app.get(`${BASE_URL}`, (req, res) => {
    res.send( "Welcome to Daily Checkup App!" );
});

app.post(`${BASE_URL}/api/send-otp`, (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  })
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    });
});

app.post(`${BASE_URL}/api/verify-otp`, (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore.get(phone) === otp) {
    otpStore.delete(phone);
    res.json({ success: true });
  } else {
    res.status(422).json({ success: false, message: 'Invalid OTP' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
