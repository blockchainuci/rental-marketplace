const express = require('express');
const router = express.Router();
const transporter = require('../config/transporter.js');

// Debugging by using a GET request
router.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Email route is working' });
});

// POST route to send email
router.post('/send-email', async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html,        // Make sure this is being used
            text: text || ''   // Fallback text
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;