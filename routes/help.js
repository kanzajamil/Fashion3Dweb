const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Contact Form Route
router.post("/send-message", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).send("All fields are required.");
    }

    try {
        // Configure Nodemailer Transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "3dfashionn@gmail.com", // Replace with your email
                pass: "dowp lbpl ugeu qlnp",    // Replace with your email password or app-specific password
            },
        });

        // Email Options
        const mailOptions = {
            from: `"${name}" <${email}>`, // Sender's name and email
            to: "3dfashionn@gmail.com",  // Receiver's email
            subject: subject,
            text: `
            You have received a new message from your website contact form.

            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            Message:
            ${message}
            `,
        };

        // Send Email
        await transporter.sendMail(mailOptions);
        req.session.flash = { type: "success", message: "Message sent successfully." };
        // Respond with Success
        res.redirect('help'); 
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("<script>alert('Failed to send message. Please try again later.'); window.location.href='/contact';</script>");
    }
});

module.exports = router;
