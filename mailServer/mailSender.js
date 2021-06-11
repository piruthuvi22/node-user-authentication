const nodeMailer = require("nodemailer");
// const { google } = require("googleapis");
// const path = require("path");

const {
  VerificationEmailTemplate,
  ResetEmailTemplate,
} = require("../utils/emailTemplate");
// const clientID = process.env.Google_Client_ID;
// const clientSecret = process.env.Google_Client_SECRET;
// const redirectURI = process.env.Google_Redirect_URI;
// const refreshToken = process.env.Google_Refresh_TOKEN;

// const OauthClient = new google.auth.OAuth2(clientID, clientSecret, redirectURI);
// OauthClient.setCredentials({ refresh_token: refreshToken });

const zohoUsername = process.env.ZOHO_USERNAME;
const zohoPassword = process.env.ZOHO_PASSWORD;

const transport = nodeMailer.createTransport({
  // service: "gmail",
  host: "smtppro.zoho.com",
  port: 587,
  auth: {
    // type: "OAuth2",
    // user: "se.house.png@gmail.com",
    // clientId: clientID,
    // clientSecret: clientSecret,
    // refreshToken: refreshToken,
    // accessToken: accessToken,
    user: zohoUsername,
    pass: zohoPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = async (emailAddress, name, activationCode) => {
  try {
    // const accessToken = await OauthClient.getAccessToken();

    const mailOptions = {
      from: "Security House <info@schoolbag.pro>",
      to: emailAddress,
      subject: "Verification Security House",
      html: VerificationEmailTemplate(name, activationCode),
    };

    transport.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Verification message sent to " + emailAddress);
      }
    });
  } catch (error) {
    return error;
  }
};

const sendResetEmail = async (emailAddress, name, resetCode) => {
  try {
    // const accessToken = await OauthClient.getAccessToken();

    const mailOptions = {
      from: "Security House <info@schoolbag.pro>",
      to: emailAddress,
      subject: "Reset Password Security House",
      html: ResetEmailTemplate(name, resetCode),
    };

    transport.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Reset email sent to " + emailAddress);
      }
    });
  } catch (error) {
    return error;
  }
};

module.exports = { sendVerificationEmail, sendResetEmail };
