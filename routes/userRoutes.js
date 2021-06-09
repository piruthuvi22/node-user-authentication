const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const path = require("path");
const { google } = require("googleapis");
const fetch = require("node-fetch");

const User = require("../model/userSchema");
const {
  userValidationRules,
  validateRegistration,
} = require("../middleware/Validations/userValidator");
const {
  loginValidationRules,
  validateLogin,
} = require("../middleware/Validations/loginValidator");
const { sendVerificationEmail } = require("../mailServer/mailSender");
const AccountVerifiedDone = require("../utils/accountVerifiedDone");

const { OAuth2 } = google.auth;
const client = new OAuth2(process.env.Google_Client_ID);

router.post("/register/check", async (req, res) => {
  try {
    await User.exists({ Username: req.body.Username }, (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        doc === true ? res.status(401).json(doc) : res.status(200).json(doc);
      }
    });
  } catch (error) {
    res.json({ error: error });
  }
});

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

      User.exists(
        { $or: [{ Email: req.body.Email }, { Username: req.body.Username }] },
        async (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).json(err);
          } else {
            if (result === true) {
              res.status(409).json("Account already exist");
            } else {
              await user
                .save()
                .then(() => {
                  sendVerificationEmail(
                    req.body.Email,
                    req.body.Name,
                    randCode
                  );
                  res
                    .status(201)
                    .json(
                      "Account created. We have sent you a verification email sent."
                    );
                })
                .catch((error) => {
                  console.log(error);
                  res.status(500).json(error);
                });
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
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
          res.status(422).json(err);
        } else {
          res.send(AccountVerifiedDone());
        }
      }
    );
  } else {
    res.status(409).json("Your account already verified");
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
        res.status(404).json("User not found");
      } else {
        const isMatch = await bcrypt.compare(
          req.body.Password,
          userData.Password
        );
        if (isMatch) {
          const userObj = Object.assign({
            Name: userData.Name,
            Username: userData.Username,
            Email: userData.Email,
            Role: userData.Role,
          });

          const userToken = await jwt.sign(
            {
              Username: userData.Username,
              Email: userData.Email,
              Role: userData.Role,
            },
            process.env.JWT_KEY
          );
          res.status(200).json({ userObj, userToken });
        } else {
          res.status(401).json("Incorrect email or password");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

router.post("/google", async (req, res) => {
  try {
    const tokenId = req.body?.tokenId;
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.Google_Client_ID,
    });
    const { email_verified, email, name, picture } = verify.payload; // picture is DP url
    if (email_verified === true) {
      try {
        let user = await User.findOne({ Email: email });
        if (user) {
          const userObj = Object.assign({
            Name: user.Name,
            Username: user.Username,
            Email: user.Email,
            Role: user.Role,
          });
          const payload = {
            Username: user.Username,
            Email: user.Email,
            Role: user.Role,
          };

          const userToken = await jwt.sign(payload, process.env.JWT_KEY);

          if (user.Status == false) {
            await User.updateOne(
              { Email: user.Email },
              {
                $unset: { createdAt: 1, ActivationCode: 1, Password: 1 },
                Status: true,
              },
              async (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  // let user to login
                  res.status(200).json({ userObj, userToken });
                }
              }
            );
          } else {
            res.status(200).json({ userObj, userToken });
            // const refresh_token = createRefreshToken({ Email: user.Email });
            // res.cookie("refresh_token", refresh_token, {
            //   httpOnly: true,
            //   maxAge: 10,
            // });
          }
        } else {
          // create new user and let to login
          let username = name.replace(/ /g, "");
          let userRandomString = nanoid(5);

          const newUser = {
            Name: name,
            Username: username + "_" + userRandomString,
            Email: email,
            Status: true,
            Role: "user",
            createdAt: "",
          };

          const userObj = Object.assign({
            Name: newUser.Name,
            Username: newUser.Username,
            Email: newUser.Email,
            Role: newUser.Role,
          });

          const payload = {
            Username: newUser.Username,
            Email: newUser.Email,
            Role: newUser.Role,
          };

          await User.create(newUser).then(() => {
            const userToken = jwt.sign(payload, process.env.JWT_KEY);
            res.status(200).json({ userObj, userToken });
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      // email is not verified
      res.json("Email is not verified");
    }
  } catch (error) {
    res.json("Something went wrong");
  }
});

router.post("/facebook", async (req, res) => {
  const { accessToken, userID } = req.body;
  console.log(accessToken, userID);

  const fbGraphUrl = ` https://graph.facebook.com/${userID}/?fields=name,email&access_token=${accessToken}`;
  fetch(fbGraphUrl).then((response) =>
    response.json().then(async (response) => {
      const { name, email } = response;
      try {
        let user = await User.findOne({ Email: email });
        if (user) {
          const userObj = Object.assign({
            Name: user.Name,
            Username: user.Username,
            Email: user.Email,
            Role: user.Role,
          });
          const payload = {
            Username: user.Username,
            Email: user.Email,
            Role: user.Role,
          };

          const userToken = jwt.sign(payload, process.env.JWT_KEY);

          if (user.Status == false) {
            await User.updateOne(
              { Email: user.Email },
              {
                $unset: { createdAt: 1, ActivationCode: 1, Password: 1 },
                Status: true,
              },
              async (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  // let user to login
                  res.status(200).json({ userObj, userToken });
                }
              }
            );
          } else {
            res.status(200).json({ userObj, userToken });
          }
        } else {
          // create new user and let to login
          let username = name.replace(/ /g, "");
          let userRandomString = nanoid(5);

          const newUser = {
            Name: name,
            Username: username + "_" + userRandomString,
            Email: email,
            Status: true,
            Role: "user",
            createdAt: "",
          };

          const userObj = Object.assign({
            Name: newUser.Name,
            Username: newUser.Username,
            Email: newUser.Email,
            Role: newUser.Role,
          });

          const payload = {
            Username: newUser.Username,
            Email: newUser.Email,
            Role: newUser.Role,
          };

          await User.create(newUser).then(() => {
            const userToken = jwt.sign(payload, process.env.JWT_KEY);
            res.status(200).json({ userObj, userToken });
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
  );
});
module.exports = router;
