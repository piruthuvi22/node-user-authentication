const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const path = require("path");

const User = require("../model/userSchema");
const {
  userValidationRules,
  validateRegistration,
} = require("../middleware/Validations/userValidator");
const {
  loginValidationRules,
  validateLogin,
} = require("../middleware/Validations/loginValidator");
const { ensureAuth, ensureGuest } = require("../middleware/auth-google");
const { sendVerificationEmail } = require("../mailServer/mailSender");
const AccountVerifiedDone = require("../utils/accountVerifiedDone");

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
          res.send(AccountVerifiedDone());
        }
      }
    );
  } else {
    res.json("Your account already verified");
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
          res.status(400).json("Login error");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

router.get("/dashboard", ensureAuth, (req, res) => {
  res.send(`<h1>dashboard</h1>
  <h2>Hello ${req.user.Name}</h2>
  <a href="/auth/logout">Logout</a>
  `);
});

router.get("/", ensureGuest, (req, res) => {
  res.send(
    `
    <a href='auth/google'>Login with google </a>
    <br>
    <a href='auth/facebook'>Login with Facebook </a>
    `
  );
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/facebook", passport.authenticate("facebook", { scope: "email" }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    await res.redirect("/auth/dashboard");
  }
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/auth/dashboard",
    failureRedirect: "/",
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/auth");
});

module.exports = router;
