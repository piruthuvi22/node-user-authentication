const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../model/userSchema");

// /check-identity
router.post("/", async (req, res) => {
  // get email,password from company service
  const email = req.body.email;
  const password = req.body.password;

  try {
    let userData = await User.findOne({ Email: email });
    if (!userData) {
      res.status(401).json({ verified: false }); // Send response FALSE
    } else {
      const isMatch = await bcrypt.compare(password, userData.Password);
      if (isMatch) {
        res.status(200).json({ verified: true }); // Send response TRUE
      } else {
        res.status(401).json({ verified: false }); // Send response FALSE
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
