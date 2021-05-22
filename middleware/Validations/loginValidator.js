const { body, validationResult } = require("express-validator");
const loginValidationRules = () => {
  return [body("Email").isEmail()];
};

const validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(400).json(extractedErrors);
};
module.exports = {
  loginValidationRules,
  validateLogin,
};
