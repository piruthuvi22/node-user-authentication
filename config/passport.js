const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const User = require("../model/userSchema");

const googlePassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.Google_Client_ID,
        clientSecret: process.env.Google_Client_SECRET,
        callbackURL: process.env.Google_Redirect_URI,
        // profileFields: ["name"],
      },
      async (accessToken, refreshToken, profile, done) => {
        let displayName = profile.displayName;
        let username = profile.displayName.replace(/ /g, "");
        let email = profile.emails[0].value;
        let userRandomString = nanoid(5);
        const newUser = {
          Name: displayName,
          Username: username + "_" + userRandomString,
          Email: email,
          Status: true,
          createdAt: "",
        };
        try {
          let user = await User.findOne({ Email: email });
          if (user) {
            if (user.Status == false) {
              await User.updateOne(
                { Email: email },
                {
                  $unset: { createdAt: 1, ActivationCode: 1, Password: 1 },
                  Status: true,
                },
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.json(err);
                  } else {
                    done(null, user);
                  }
                }
              );
            } else {
              done(null, user);
            }
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (error) {
          console.log(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

const facebookPassport = (passport) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_Client_ID,
        clientSecret: process.env.FB_Client_SECRET,
        callbackURL: process.env.FB_Redirect_URI,
        // profileFields: [],
        profileFields: ["id", "displayName", , "email", "gender"],
      },
      async (token, refreshToken, profile, done) => {
        let displayName = profile.displayName;
        let username = profile.displayName.replace(/ /g, "");
        let email = profile.emails[0].value;
        let userRandomString = nanoid(5);
        const newUser = {
          Name: displayName,
          Username: username + "_" + userRandomString,
          Email: email,
          Password: " ",
          createdAt: "",
        };
        try {
          let user = await User.findOne({ Email: email });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (error) {
          console.log(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("serializeUser");
    // console.log(user.id + "3");
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

module.exports = { googlePassport, facebookPassport };
