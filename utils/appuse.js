const morgan = require("morgan");

module.exports.appuse = (app) => {
  app.use(morgan("dev"));
  //app.use(require("../src/user/user.api"));
};
