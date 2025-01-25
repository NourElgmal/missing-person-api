const { Auth } = require("../../utils/decoded_jwt");
const { UplodefieldsFiles } = require("../../utils/fileuplode");
const {
  Signup,
  Verification,
  Delete_Account,
  Login_with_google,
  Google_Callback,
  Login_with_google_sec,
  Login_with_google_fel,
  Login_Complete_data,
  Login,
  Forget_password,
  Verification_pass,
  UpdateAccount,
  DeleteAccount,
  GetAccount,
} = require("./user.service");

const router = require("express").Router();
const pathsname = [{ name: "img", maxCount: 3 }];

router.route("/user").post(Signup);

router.route("/user/login").post(Login);
router.route("/Verification").post(Verification);
router.get("/Verification/:token", Delete_Account);
router.get("/auth/google", Login_with_google);
router.get("/google/callback", Google_Callback);
router.get("/Login_with_google_sec", Login_with_google_sec);
router.get("/Login_with_google_fel", Login_with_google_fel);
router.post("/Login_Complete_data", Auth, Login_Complete_data);
router.post("/user/change_password", Forget_password);
router.post("/user/changepassword", Verification_pass);
router.put("/user/UpdateAccount", Auth, UpdateAccount);
router.delete("/user/DeleteAccount", Auth, DeleteAccount);
router.get("/user/GetAccount", Auth, GetAccount);
module.exports = router;
