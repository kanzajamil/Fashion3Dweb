/*const express = require("express");
let router = express.Router();
let Members = require("../../models/member");
const {authenticateToken} = require('../../middlewares/authenticateToken');
router.get("/api/members/:id", async function (req, res) {
  // return res.send(req.params);
  let members = await Members.findById(req.params.id);
  res.send(members);
});
router.put("/api/members/:id", async function (req, res) {
  // return res.send(req.params);
  let members = await Members.findById(req.params.id);
  members.model = req.body.model;
  members.name = req.body.name;
  members.designation = req.body.designation;
  await members.save();
  res.send(members);
});
router.delete("/api/members/:id", async function (req, res) {
  // return res.send(req.params);
  let members = await Members.findByIdAndDelete(req.params.id);
  res.send(members);
});
router.post("/api/members", async function (req, res) {
  // res.send(req.body);
  let members = new Members(req.body);
  await members.save();
  return res.send(members);
});
router.get("/about", authenticateToken, async function (req, res) {
  console.log(req.user);
  let members = await Members.find();
  res.render("about",{members});
});


module.exports = router;*/