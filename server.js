const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const resetPassword = require("./routes/resetRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/auth", userRoutes);
app.use("/account/reset", resetPassword);

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
