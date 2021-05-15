const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const User = require("../model/userSchema");
const {
  userValidationRules,
  validateRegistration,
} = require("../middleware/Validations/userValidator");
const {
  loginValidationRules,
  validateLogin,
} = require("../middleware/Validations/loginValidator");
const sendVerificationEmail = require("../mailServer/mailSender");

router.post(
  "/register",
  userValidationRules(),
  validateRegistration,
  async (req, res) => {
    try {
      let randCode = nanoid(10) + Date.now();
      const user = new User({
        Name: req.body.Name,
        Username: req.body.Username,
        Email: req.body.Email,
        Password: req.hash,
        ActivationCode: randCode,
      });

      await user
        .save()
        .then(() => {
          sendVerificationEmail(req.body.Email, req.body.Name, randCode);
          res.json("User saved and email sent");
        })
        .catch(
          (error) =>
            error.code === 11000 &&
            res.json(`${Object.keys(error.keyValue)} already exist`)
        );
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

router.get("/verify/:activationCode", async (req, res) => {
  const activationCode = req.params.activationCode;
  let doc = await User.findOne({ ActivationCode: activationCode });

  if (doc !== null) {
    await User.updateOne(
      { ActivationCode: activationCode },
      { $unset: { createdAt: 1, ActivationCode: 1 }, Status: true },
      (err, result) => {
        if (err) {
          console.log(err);
          res.json(err);
        } else {
          console.log(result);
          res.json("Email verified successfully");
        }
      }
    );
  } else {
    res.json("Email verification failed");
  }
});

router.post(
  "/login",
  loginValidationRules(),
  validateLogin,
  async (req, res) => {
    try {
      let userData = await User.findOne({ Email: req.body.Email });
      if (!userData) {
        res.status(400).json("User not found");
      } else {
        const isMatch = await bcrypt.compare(
          req.body.Password,
          userData.Password
        );
        if (isMatch) {
          const userToken = await jwt.sign(
            {
              Email: userData.Email,
              Name: userData.Name,
              Username: userData.Username,
            },
            process.env.JWT_KEY
          );

          res.header("JWT-KEY", userToken).json(userToken);
        } else {
          res.status(400).json("Password not match");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

module.exports = router;
