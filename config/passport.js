const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const User = require("../model/userSchema");

const googlePassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
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
        clientID: "303547561493723",
        clientSecret: "c804fab5b1191bcb32644dcc3745528f",
        callbackURL: "/auth/facebook/callback",
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
