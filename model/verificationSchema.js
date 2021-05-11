const mongoose = require("mongoose");

const VerificationSchema = mongoose.Schema({
  Email: {
    type: String,
    required: true,
  },
  Code: {
    type: String,
    required: true,
  },
  DateCreated: { type: Date, default: Date.now, index: { expires: 60 } },
});

module.exports = mongoose.model("Verification", VerificationSchema);
