const express = require("express");
let router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let User = require("../../models/user");


router.get("/login", (req, res) => {
  //   return res.send(req.query);
  res.render("login");
});
router.get("/signup", (req, res) => {
    //   return res.send(req.query);
    res.render("signup");
  });
router.get("/logout", (req, res) => {
  //   return res.send(req.query);
  req.session.user = null;
  req.session.flash = { type: "info", message: "Logged Out" };
  res.redirect("login");
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.redirect("/login");
  const bcrypt = require("bcryptjs");
  console.log(req.body);
  const isValid = await bcrypt.compare(password, user.password);
  if (isValid) {
    req.session.user = user;
    req.session.flash = { type: "success", message: "Logged in Successfully" };
    return res.redirect("/try-now");

  } else {
    req.session.flash = { type: "danger", message: "Incorrect Password. Please Try Again." };

    return res.redirect("/login");
  }
  // res.status(400).send({ isValid });
});

router.post("/signup", async (req, res) => {
  let user = new User(req.body);
  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  //   return res.send(user);
  req.session.flash = { type: "success", message: "Account Created Sucessfully. Now Login please." };
  return res.redirect("/login");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.session.flash = { type: "danger", message: "Email not found" };
    return res.redirect("/login");
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
  await user.save();

  // Send reset link via email
  const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
  await sendResetEmail(user.email, resetLink);

  req.session.flash = { type: "info", message: "Password reset link sent to your email" };
  res.redirect("/login");
});



// Route to verify the current password
router.post('/verify-password', async (req, res) => {
    const { currentPassword } = req.body;
    const userId = req.session.user._id; // Assuming user ID is stored in the session or token

    try {
        // Fetch the user from the database
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        const bcrypt = require("bcryptjs");
        // Compare the entered current password with the hashed password in the database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (isMatch) {
            res.json({ message: "Password verified" });
        } else {
            res.status(400).json({ error: "Incorrect current password" });
        }
    } catch (error) {
        console.error("Error verifying password:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Route to update the new password
router.post('/update-password', async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.session.user._id;

  try {
      // Hash the new password
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const foundUser = await User.findById(userId); // Assuming user ID is stored in session
       
        if (foundUser) {
            // Update the user's name
            foundUser.password = hashedPassword; 
            await foundUser.save();
        }
            // Update the session with the new user data if needed
             // Save updated user data in session
            req.session.user = foundUser.toObject();
             

            console.log('Emai updated successfully:', foundUser.password);
            req.session.flash = { type: "success", message: "Password Updated Successfully." };
  
            res.render('settings'); 
      // Update the user's password in the database
      
  } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
  }
});



// Reset Password Route (rendering the reset form)
router.get("/reset-password/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.session.flash = { type: "danger", message: "Password reset token is invalid or has expired" };
    return res.redirect("/login");
  }

  res.render("reset-password", { token: req.params.token });
});

// Handle new password submission
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.session.flash = { type: "danger", message: "Password reset token is invalid or has expired" };
    return res.redirect("/login");
  }
  const bcrypt = require("bcryptjs");
  // Update the user's password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.session.flash = { type: "success", message: "Password has been reset. Please log in." };
  res.redirect("/login");
});

// Function to send the reset email
async function sendResetEmail(email, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "3dfashionn@gmail.com",
      pass: "dowp lbpl ugeu qlnp",
    },
  });

  const mailOptions = {
    to: email,
    from:'"Fashion3D" <3dfashionn@gmail.com>' ,
    subject: "Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetLink}" style="display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Change Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you!</p>
        <p>Best regards,<br>Your Support Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;