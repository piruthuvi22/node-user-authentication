const nodeMailer = require("nodemailer");
const { google } = require("googleapis");

const {
  VerificationEmailTemplate,
  ResetEmailTemplate,
} = require("../utils/emailTemplate");

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;

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
    });
    const mailOptions = {
      from: "SchoolBag <noreply.mycodecademypro2@gmail.com>",
      to: emailAddress,
      subject: "Verification SchoolBag",
      html: VerificationEmailTemplate(name, activationCode),
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
