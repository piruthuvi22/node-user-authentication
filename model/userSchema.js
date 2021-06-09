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
    required: false,
  },
  Role: {
    type: String,
    default: "user",
  },
  Status: {
    type: Boolean,
    default: false,
    required: false,
  },
  expireAt: {
    type: Date,
    expires: 30 * 60,
  },
  ActivationCode: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("User", UserSchema);
