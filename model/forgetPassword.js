const mongoose = require("mongoose");

const ForgetPasswordSchema = mongoose.Schema({
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  ResetCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: "5min",
    default: Date.now,
  },
});

module.exports = mongoose.model("ForgetPassword", ForgetPasswordSchema);
