const router = require("express").Router();
const bcrypt = require("bcryptjs");

const User = require("../model/userSchema");
const ForgetPassword = require("../model/forgetPassword");
const upload = require("../middleware/storage");

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
      res.status(200).json("Password changed");
    } else {
      res.status(401).json("Mismatch OldPassword");
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

router.patch(
  "/update-profile",
  upload.single("profile-img"),
  auth,
  (req, res) => {
    const body = Object.assign({}, req.body);
    let obj = {};
    body.hasOwnProperty("school") && (obj.school = req.body.school);
    body.hasOwnProperty("name") && (obj.name = req.body.name);
    body.hasOwnProperty("email") && (obj.email = req.body.email);
    body.hasOwnProperty("year") && (obj.year = req.body.year);
    body.hasOwnProperty("nickname") && (obj.nickname = req.body.nickname);
    if (req.file !== undefined) {
      console.log(obj); // update fields
      console.log(req.file.path); // image path
    } else {
      console.log(obj); // update fields
    }
    res.end();
  }
);

module.exports = router;
