
const mongoose = require("mongoose");

let modelSchema = new mongoose.Schema({
  title: String,
  date: { type: Date, default: Date.now },
  filePaths: [
    {
      type: {
        type: String,  // 'upper', 'bottom', 'smpl', or 'combined'
      },
      path: {
        type: String,  // the file path for each model part
      },
    },
  ],
});

let userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  models: [modelSchema],
  resetPasswordToken: String,       // Stores the unique token for password reset
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = User;


