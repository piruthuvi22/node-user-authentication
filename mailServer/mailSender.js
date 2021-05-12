const nodeMailer = require("nodemailer");
const { google } = require("googleapis");

const emailTemplate = require("./emailTemplate");
const clientID =
  "294751671415-qgkj1emjaf45gjri1m945v670j37t92r.apps.googleusercontent.com";
const clientSecret = "2Ji6l_DMkoGxAOvfohU_TwVy";
const redirectURI = "https://developers.google.com/oauthplayground";
const refreshToken =
  "1//04VkjyhwZ7Gv1CgYIARAAGAQSNwF-L9IrbucFPraGgUir9SZcVGbUnrYx3TFPlrGEu11AKHsjB2iPDLaxOHEs3dVlzuc-34rWjg4";

const OauthClient = new google.auth.OAuth2(clientID, clientSecret, redirectURI);
OauthClient.setCredentials({ refresh_token: refreshToken });

const sendEmail = async (emailAddress, activationCode) => {
  try {
    const accessToken = await OauthClient.getAccessToken();
    const transport = await nodeMailer.createTransport({
      service: "gmail",
      //   host: "smtp.gmail.com",
      //   port: 465,
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
      html: emailTemplate(activationCode),
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

module.exports = sendEmail;
