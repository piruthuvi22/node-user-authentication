const nodeMailer = require("nodemailer");
const { google } = require("googleapis");

const clientID =
  "294751671415-qgkj1emjaf45gjri1m945v670j37t92r.apps.googleusercontent.com";
const clientSecret = "2Ji6l_DMkoGxAOvfohU_TwVy";
const redirectURI = "https://developers.google.com/oauthplayground";
const refreshToken =
  "1//04VkjyhwZ7Gv1CgYIARAAGAQSNwF-L9IrbucFPraGgUir9SZcVGbUnrYx3TFPlrGEu11AKHsjB2iPDLaxOHEs3dVlzuc-34rWjg4";

const OauthClient = new google.auth.OAuth2(clientID, clientSecret, redirectURI);
OauthClient.setCredentials({ refresh_token: refreshToken });

const sendEmail = async (emailAddress) => {
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
      html: `<h1>Please click the link below to activate your account</h1>
      <img src="https://schoolbagapp.herokuapp.com/images/logo1.png" width="500px" alt="SchoolBag"/><br>
          <a href="http://localhost:8000/auth/verify/"><button><h3>Verify</h3></button></a>`,
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
