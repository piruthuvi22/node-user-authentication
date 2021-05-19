const nodeMailer = require("nodemailer");
const { google } = require("googleapis");

const {
  VerificationEmailTemplate,
  ResetEmailTemplate,
} = require("../utils/emailTemplate");

const clientID =
  "927827745982-hisl3umkhplkt359k6483mh2n3o9lcar.apps.googleusercontent.com";
const clientSecret = "Ui9YehvafSdAbFmHgIp8IGmw";
const redirectURI = "https://developers.google.com/oauthplayground";
const refreshToken =
  "1//04wTVQ8gPe0LRCgYIARAAGAQSNwF-L9IrJEc3H9QN3IsK-PfC2MRvFXtFagUpQSv61B75kqLM-lOLQZR-hAE2jaPR1E42VdYV3ek";

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
      from: "SchoolBag <mycodecademypro2@gmail.com>",
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
