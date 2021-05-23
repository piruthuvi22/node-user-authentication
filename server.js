const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
// const session = require("express-session");
const cookieSession = require("cookie-session");

const MongoStore = require("connect-mongo");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const resetPassword = require("./routes/resetRoutes");
const forgetPasswordRoutes = require("./routes/forgetPasswordRoutes");

const { googlePassport, facebookPassport } = require("./config/passport");
googlePassport(passport);
facebookPassport(passport);

// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: true,
//     saveUninitialized: true,
//     store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//   })
// );

app.use(
  cookieSession({
    maxAge: 7200000,
    keys: ["mysecret1", "mysecret2"],
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/auth", userRoutes);
app.use("/account", resetPassword);
app.use("/forget-password", forgetPasswordRoutes);

const uri = process.env.MONGO_URI;
let connection = mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
connection
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Database connection established");
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("connection failed", err);
  });
