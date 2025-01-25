const userModule = require("../src/user/user.module");
const jwt = require("jsonwebtoken");
const AppErr = require("./Apperr");
const expressAsyncHandler = require("express-async-handler");

module.exports.Auth = expressAsyncHandler(async (req, res, next) => {
  const tok = req.header("token");
  if (!tok) {
    return next(new AppErr("Authorization token is required", 400));
  }

  jwt.verify(tok, process.env.Key_Jwt_Token, async (err, decoded) => {
    if (err) {
      return next(new AppErr("Invalid authorization token", 401));
    }

    const user = await userModule.findById(decoded.id);
    if (!user) {
      return next(new AppErr("User not found or has been deleted", 404));
    }

    if (user.change_pass) {
      let token_time = Math.floor(user.change_pass.getTime() / 1000);

      if (token_time > decoded.iat) {
        return next(
          new AppErr("Token is no longer valid. Please log in again.", 401)
        );
      }
    }

    req.id = decoded.id;
    next();
  });
});
/*
module.exports.AlowedTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.role)) {
      next();
    } else {
      return next(new AppErr("Access denied. Insufficient permissions.", 403));
    }
  };
};
*/
