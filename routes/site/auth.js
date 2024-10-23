const express = require("express");
let router = express.Router();
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
    req.session.flash = { type: "danger", message: "Try Again" };

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
  req.session.flash = { type: "success", message: "Account Created. Now Login please." };
  return res.redirect("/login");
});

module.exports = router;