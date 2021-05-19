const router = require("express").Router();
const bcrypt = require("bcryptjs");

const User = require("../model/userSchema");
const ForgetPassword = require("../model/forgetPassword");

const auth = require("../middleware/auth");
const {
  passwordValidationRules,
  validatePassword,
} = require("../middleware/Validations/passwordValidator");
const passForm = require("../utils/form");
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
      res.json("Password changed");
    } else {
      res.json("Mismatch OldPassword");
    }
  }
);

router.get("/reset-password", (req, res) => {
  const activationCode = req.query["activation-code"];
  res.send(passForm(activationCode));
});

router.post(
  "/reset-password/:resetCode",
  passwordValidationRules(),
  validatePassword,
  async (req, res) => {
    const ResetCode = req.params.resetCode;
    const data = await ForgetPassword.findOneAndRemove({ ResetCode });
    if (data !== null) {
      const Email = data.Email;
      const newPassword = req.hash;

      await User.updateOne({ Email }, { Password: newPassword });
      res.status(200).json("Password Reseted");
    } else {
      res.status(408).json("No reset request found or request timedout");
    }
  }
);

module.exports = router;
