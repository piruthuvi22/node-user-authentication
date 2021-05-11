const router = require("express").Router();
const jwt = require("jsonwebtoken");
var chance = require("chance").Chance();
const User = require("../model/userSchema");
const VerificationSchema = require("../model/verificationSchema");
const auth = require("../middleware/auth");
const {
  userValidationRules,
  validateRegistration,
  validateLogin,
} = require("../Validations/userValidator");
const sendEmail = require("../mailServer/mailSender");

router.post(
  "/register",
  userValidationRules(),
  validateRegistration,
  async (req, res) => {
    try {
      const user = new User({
        Name: req.body.Name,
        Username: req.body.Username,
        Email: req.body.Email,
        Password: req.hash,
      });
      let randCode = chance.string({ length: 10 }) + Date.now();
      const verify = new VerificationSchema({
        Email: req.body.Email,
        Code: randCode,
      });
      await verify
        .save()
        .then(() => {
          console.log("saved in temp");
          sendEmail(req.body.Email)
            .then((result) => res.json(result))
            .catch((err) => console.log(err));
        })
        .catch((err) => res.json(err));

      await user
        .save()
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((error) => {
          {
            error.code === 11000 &&
              res.json(`${Object.keys(error.keyValue)} already exist`);
          }
        });
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

router.post(
  "/login",
  userValidationRules(),
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
            { Email: userData.Email, Name: userData.Name },
            process.env.JWT_KEY
          );

          res.header("JWT-KEY", userToken).json(userToken);
        } else {
          res.status(400).json("Password not match");
        }
      }
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

router.get("/get-data", auth, async (req, res) => {
  const userEmail = req.decoded.Email;
  const data = await User.findOne({ Email: userEmail }).select([
    "Name",
    "Email",
  ]);
  res.json(data);
});

module.exports = router;
