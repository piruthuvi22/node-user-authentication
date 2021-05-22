const bcrypt = require("bcryptjs");
const { body, check, validationResult } = require("express-validator");
const passwordValidationRules = () => {
  return [
    // body("Email").isEmail(),
    // body("Password"),
    check("NewPassword").custom((value, { req }) => {
      if (value !== req.body.ConfirmPassword) {
        throw new Error("Passwords must be same");
      }
      return true;
    }),
    body("NewPassword").matches(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}"
    ),
  ];
};

const validatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const hash = await bcrypt.hash(req.body.NewPassword, 10);
    req.hash = hash;
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(400).json(extractedErrors);
};

module.exports = {
  passwordValidationRules,
  validatePassword,
};
