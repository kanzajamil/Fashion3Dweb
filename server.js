let express = require("express");
let cookieParser = require("cookie-parser");
var session = require("express-session");
var expressLayouts = require("express-ejs-layouts");
let app = express();

//const fileUpload = require("express-fileupload");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "Shh, its a secret!" ,resave: false,
saveUninitialized: true}));




const common = require("./middlewares/common");
const logger = require("./middlewares/logger");
const sessionauth = require("./middlewares/sessionauth");
const admin = require("./middlewares/admin");
const isLoggedin = require("./middlewares/authMiddleware");
const ensureAuthenticated = require("./middlewares/authenticated");


//app.use(sessionauth);
app.get("/views", (req, res) => {
  let visits = req.cookies.visits;

  if (!visits) visits = 1;
  else visits = visits + 1;
  res.cookie("visits", visits);
  res.send({ visits });
});

/*app.use(fileUpload({
  useTempFiles : true,
}));*/

app.use(common);
app.use("/", require("./routes/site/auth"));

//app.use("/admin", sessionauth, admin, require("./routes/admin/newz"));
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);



const integRoutes = require("./routes/integrationRoute");
app.use(integRoutes);

const modelRoutes = require("./routes/modelRoutes.js");
app.use(modelRoutes);

const editRoutes = require("./routes/modelEditroutes.js");
app.use(editRoutes);

const editProfileRoutes = require("./routes/editProfile.js");
app.use(editProfileRoutes);

const delAccRoutes = require("./routes/deleteAccountRoute.js");
app.use(delAccRoutes);

const helpRoutes = require("./routes/help.js");
app.use(helpRoutes);

const animRoutes = require("./routes/animationRoutes.js");
app.use(animRoutes);

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/help", helpRoutes, function (req, res) {
  res.render("help");
});
app.get("/model-edit", function (req, res) {
  res.render("model-edit");
});


app.get("/user-dash", ensureAuthenticated, function (req, res) {
  res.render("user-dash");
});

app.get("/try-now", function (req, res) {
  let modelPath = null;
  res.render("try-now", {modelPath});
});

app.get("/image-to-3d", function (req, res) {
  res.render("image-to-3d");
});
app.get("/modeledit/:modelId", function (req, res) {
  res.render("modeledit",{ scrollTo: 'at-main' });
});

app.get("/animate/:modelId", function (req, res) {
  let animatedModelPath = null;
  res.render("animate", {animatedModelPath});
});


app.get("/settings", function (req, res) {
  res.render("settings");
});

app.get("/login", function (req, res) {
    res.render("login");
  });
// Route to render the Forgot Password page
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");  // forgot-password.ejs
});

// Route to render the Reset Password page
app.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.render("reset-password", { token });  // reset-password.ejs
});


app.get("/signup", function (req, res) {
  res.render("signup");
});

const mongoose = require("mongoose");
const { cookie } = require("express/lib/response");
mongoose
  .connect("mongodb://0.0.0.0:27017/project")
  .then(() => console.log("Connected to Mongo...."))
  .catch((error) => console.log(error.message));

app.listen(4000);


