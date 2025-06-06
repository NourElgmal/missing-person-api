const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const AppErr = require("../../utils/Apperr");
const { Send_Email } = require("../../utils/sendemail");
const userModule = require("./user.module");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const fs = require("fs");
const { deleteFile } = require("../../utils/deleteimg");
require("../../utils/passport");
function generateRandomNumber() {
  return Math.floor(10000 + Math.random() * 90000);
}
module.exports.Signup = expressAsyncHandler(async (req, res, next) => {
  let { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return next(new AppErr("All fields are required", 400));
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS) || 5
  );
  const existingUser = await userModule.findOne({ email });

  if (existingUser) {
    if (!existingUser.verified) {
      return next(
        new AppErr("User with this email already exists and not verified", 400)
      );
    }
    return next(new AppErr("User with this email already exists", 409));
  }

  const user = new userModule({
    name,
    email,
    password: hashedPassword,
    phone,
    googleId: email,
  });

  try {
    let code = generateRandomNumber();
    const token = jwt.sign({ email: email }, process.env.Key_Jwt_Token);
    Send_Email(email, code, token);
    user.verification_code = code;
    await user.save();
    res.status(201).json({
      message:
        "User created successfully Activation code has been sent to your email",
      user,
    });
  } catch (error) {
    next(new AppErr("User not created", 500));
  }
});
module.exports.Verification = expressAsyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const user = await userModule.findOne({ email });
  if (!user) {
    return next(new AppErr("User not found", 404));
  }
  if (user.verified) {
    return next(new AppErr("Account already verified", 400));
  }
  if (user.verification_code != code) {
    return next(new AppErr("Invalid verification code", 400));
  }
  user.verified = true;

  await user.save();
  res.status(200).json({ message: "Account verified successfully" });
});

module.exports.Delete_Account = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  jwt.verify(token, process.env.Key_Jwt_Token, async (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.status(403).json({ message: "Invalid token", error: err });
    }

    const { email } = decoded;
    console.log("Decoded email:", email);

    try {
      const user = await userModule.findOneAndDelete({ email });
      if (!user) {
        return next(new AppErr("User not found", 404));
      }

      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      next(new AppErr("Failed to delete account", 500));
    }
  });
});

module.exports.Login_with_google = expressAsyncHandler(
  passport.authenticate("google", { scope: ["profile", "email"] })
);

module.exports.Google_Callback = expressAsyncHandler(
  passport.authenticate("google", {
    failureRedirect: "/Login_with_google_fel",
    successRedirect: "/Login_with_google_sec",
  })
);

module.exports.Login_with_google_sec = expressAsyncHandler(
  async (req, res, next) => {
    const user = req.user.email;
    console.log("User from google:", user);
    const u = await userModule.findOne({ email: user });
    if (!u) {
      return next(new AppErr("User not found", 404));
    }

    const token = jwt.sign(
      { id: u._id, role: u.role },
      process.env.Key_Jwt_Token
    );
    res.json({
      Login: "true",
      token: token,
    });
  }
);
module.exports.Login_with_google_fel = expressAsyncHandler((req, res, next) => {
  res.json({ Login: "fales" });
});
module.exports.Login_Complete_data = expressAsyncHandler(
  async (req, res, next) => {
    const { phone } = req.body;

    try {
      const user = await userModule.findById(req.id);

      if (!user) {
        return next(new AppErr("User not found", 404));
      }

      user.phone = phone;
      await user.save();

      res
        .status(200)
        .json({ message: "User data complete successfully", user });
    } catch (error) {
      next(error);
    }
  }
);
module.exports.Login = expressAsyncHandler(async (req, res, next) => {
  const { email, password, myAppToken } = req.body;
  if (!email || !password) {
    return next(new AppErr("All fields are required", 400));
  }
  const user = await userModule.findOne({ email });
  if (!user) {
    return next(new AppErr("User not found", 404));
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppErr("Invalid credentials", 401));
  }
  if (!user.verified) {
    return next(new AppErr("Account is not verified check your email", 401));
  }
  await user.updateOne({ $addToSet: { myAppToken: myAppToken } });
  console.log(myAppToken);

  const token = jwt.sign(
    { email: user.email, id: user._id, role: user.role },
    process.env.Key_Jwt_Token
  );
  res.status(201).json({ message: "login true", token: token });
});

module.exports.Forget_password = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppErr("Email is required", 400));
  }
  const user = await userModule.findOne({ email });
  if (!user) {
    return next(new AppErr("User not found", 404));
  }
  const code = generateRandomNumber();
  Send_Email(email, code, "");
  user.verification_code = code;
  await user.save();
  res.status(200).json({ message: "Verification code sent to your email" });
});
module.exports.Verification_pass = expressAsyncHandler(
  async (req, res, next) => {
    const { email, code, new_pass } = req.body;
    const user = await userModule.findOne({ email: email });
    if (!user) {
      return next(new AppErr("User not found", 404));
    }

    if (user.verification_code != code) {
      return next(new AppErr("Invalid verification code", 400));
    }
    if (user.verified) {
      user.password = await bcrypt.hash(
        new_pass,
        Number(process.env.saltRounds) || 5
      );
      user.change_pass = Date.now();
    } else {
      return next(new AppErr("Account is not verified", 400));
    }
    await user.save();
    res.status(200).json({ message: "password change successfully " });
  }
);
module.exports.UpdateAccount = expressAsyncHandler(async (req, res, next) => {
  const id = req.id;
  const User = await userModule.findById(id);
  if (!User) {
    return next(new AppErr("User not found", 404));
  }

  const user = await userModule.findByIdAndUpdate(id, req.body, { new: true });
  if (!user) {
    return next(new AppErr("User not found", 404));
  }
  user.change_pass = Date.now();
  await user.save();
  res.status(200).json({ message: "Account updated successfully", user });
});

module.exports.DeleteAccount = expressAsyncHandler(async (req, res, next) => {
  const id = req.id;
  const user = await userModule.findByIdAndDelete(id);

  if (!user) {
    return next(new AppErr("User not found", 404));
  }

  res.status(200).json({ message: "Account deleted successfully" });
});

module.exports.GetAccount = expressAsyncHandler(async (req, res, next) => {
  const id = req.id;
  const user = await userModule.findById(id);
  if (!user) {
    return next(new AppErr("User not found", 404));
  }
  res.status(200).json({ user });
});
