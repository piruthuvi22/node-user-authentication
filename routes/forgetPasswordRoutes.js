const router = require("express").Router();
const { nanoid } = require("nanoid");

const {
  emailValidationRules,
  validateEmail,
} = require("../middleware/Validations/emailValidator");
const { sendResetEmail } = require("../mailServer/mailSender");

const User = require("../model/userSchema");
const ForgetPassword = require("../model/forgetPassword");

router.post("/", emailValidationRules(), validateEmail, async (req, res) => {
  const { Email } = req.body;
  const email = await User.findOne({ Email }).select({
    Email: 1,
    Name: 1,
    _id: 0,
  });
  if (email !== null) {
    let randCode = nanoid(30) + Date.now();
    const data = new ForgetPassword({
      Email,
      ResetCode: randCode,
    });
    await data
      .save()
      .then(() => {
        sendResetEmail(Email, email.Name, randCode);
        res.status(200).json("Reset email sent this mail valid for 5 minutes");
      })
      .catch(
        (error) =>
          error.code === 11000 &&
          res
            .status(102)
            .json(
              `Already reset email have sent to${Object.keys(error.keyValue)}`
            )
      );
  } else {
    res.status(404).json("User not found");
  }
});

module.exports = router;
