module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/auth");
    }
  },
  ensureGuest: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect("/auth/dashboard");
    } else {
      return next();
    }
  },
};
