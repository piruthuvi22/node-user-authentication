const { body, validationResult } = require("express-validator");

const emailValidationRules = () => {
  return [body("Email").isEmail()];
};

const validateEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(400).json(extractedErrors);
};

module.exports = {
  emailValidationRules,
  validateEmail,
};
