const router = require("express").Router();
const bcrypt = require("bcryptjs");

const User = require("../model/userSchema");
const ForgetPassword = require("../model/forgetPassword");

const auth = require("../middleware/auth");
const {
  passwordValidationRules,
  validatePassword,
} = require("../middleware/Validations/passwordValidator");

router.post(
  "/change-password",
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

router.get("/reset-password/:resetCode", (req, res) => {
  res.send("Password reset hit");
});

router.post(
  "/reset-password/:resetCode",
  passwordValidationRules(),
  validatePassword,
  async (req, res) => {
    const ResetCode = req.params.resetCode;
    const data = await ForgetPassword.findOne({ ResetCode });
    if (data !== null) {
      const Email = data.Email;
      const newPassword = req.hash;

      await User.updateOne({ Email }, { Password: newPassword });
      res.json("Password Reseted");
    } else {
      res.json("Password reset request timedout");
    }
  }
);

module.exports = router;
