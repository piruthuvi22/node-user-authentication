const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Username: {
    type: String,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    expires: "5min",
    default: Date.now,
  },
  ActivationCode: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
