const router = require("express").Router();
const bcrypt = require("bcryptjs");

const User = require("../model/userSchema");
const auth = require("../middleware/auth");
const {
  passwordValidationRules,
  validatePassword,
} = require("../Validations/passwordValidator");

router.post(
  "/",
  auth,
  passwordValidationRules(),
  validatePassword,
  async (req, res) => {
    const userEmail = req.decoded.Email;
    const newPassword = req.hash;
    const { Password } = await User.findOne({ Email: userEmail }).select({
      Password: 1,
      _id: 0,
    });
    const isMatch = await bcrypt.compare(req.body.OldPassword, Password);
    if (isMatch) {
      await User.updateOne({ Email: userEmail }, { Password: newPassword });
      res.json("Password updated");
    } else {
      res.json("Mismatch OldPassword");
    }
  }
);

module.exports = router;
