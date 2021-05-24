const nodeMailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");

const {
  VerificationEmailTemplate,
  ResetEmailTemplate,
} = require("../utils/emailTemplate");
console.log(process.env.INIT_CWD);
const clientID = process.env.Google_Client_ID;
const clientSecret = process.env.Google_Client_SECRET;
const redirectURI = process.env.Google_Redirect_URI;
const refreshToken = process.env.Google_Refresh_TOKEN;

const OauthClient = new google.auth.OAuth2(clientID, clientSecret, redirectURI);
OauthClient.setCredentials({ refresh_token: refreshToken });

const sendVerificationEmail = async (emailAddress, name, activationCode) => {
  try {
    const accessToken = await OauthClient.getAccessToken();
    const transport = await nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "mycodecademypro2@gmail.com",
        clientId: clientID,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: "SchoolBag <noreply.mycodecademypro2@gmail.com>",
      to: emailAddress,
      subject: "Verification SchoolBag",
      html: VerificationEmailTemplate(name, activationCode),
      // attachments: [
      //   {
      //     filename: "logo.png",
      //     path: process.env.INIT_CWD + "/assets/logo.png",
      //     cid: "unique@kreata.ee", //same cid value as in the html img src
      //   },
      // ],
    };

    await transport.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email message sent");
      }
    });
  } catch (error) {
    return error;
  }
};

const sendResetEmail = async (emailAddress, name, resetCode) => {
  try {
    const accessToken = await OauthClient.getAccessToken();
    const transport = await nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "mycodecademypro2@gmail.com",
        clientId: clientID,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: "SchoolBag <mycodecademypro2@gmail.com>",
      to: emailAddress,
      subject: "Reset Password SchoolBag",
      html: ResetEmailTemplate(name, resetCode),
    };

    await transport.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email message sent");
      }
    });
  } catch (error) {
    return error;
  }
};

module.exports = { sendVerificationEmail, sendResetEmail };
