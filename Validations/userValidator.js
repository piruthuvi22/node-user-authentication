const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const userValidationRules = () => {
  return [
    body("Email").isEmail(),
    // body("Password"),
    body("Password").matches(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}"
    ),
  ];
};

const validateRegistration = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const hash = await bcrypt.hash(req.body.Password, 10);
    req.hash = hash;
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(422).json(extractedErrors);
};

const validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(422).json(extractedErrors);
};
module.exports = {
  userValidationRules,
  validateRegistration,
  validateLogin,
};
