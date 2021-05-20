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
    required: false,
  },
  createdAt: {
    type: Date,
    expires: "5min",
    default: Date.now,
    required: false,
  },
  ActivationCode: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("User", UserSchema);
