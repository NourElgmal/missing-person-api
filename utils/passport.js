const GoogleStrategy = require("passport-google-oauth20").Strategy;
const user_model = require("../src/user/user.module");
const passport = require("passport");
const AppErr = require("./Apperr");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.callbackURL,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (!email) {
          return cb(new Error("Email not provided by Google profile"), null);
        }
        let User = await user_model.findOne({ email: email });
        if (User) {
          return cb(new Error("Email is already use"), null);
        }
        let user = await user_model.findOne({ googleId: profile.id });
        if (!user) {
          user = new user_model({
            googleId: profile.id,
            email: email,
            name: profile.name.givenName,
            phone: "",
            verified: true,
          });
          await user.save();
        }
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await user_model.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
});
