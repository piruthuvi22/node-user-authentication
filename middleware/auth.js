const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  const token = req.header("JWT-KEY");
  if (!token) {
    return res.status(401).json("Access denied");
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.decoded = decoded;
      next();
    } catch (error) {
      res.status(400).json("invalid token");
    }
  }
};

module.exports = auth;
