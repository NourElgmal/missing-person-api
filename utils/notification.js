const admin = require("firebase-admin");
const User = require("../src/user/user.module");

module.exports.fairmassage = async function sendNotificationToUserByEmail(
  email,
  title,
  body
) {
  try {
    const user = await User.findOne({ email });

    if (!user || !user.myAppToken || user.myAppToken.length === 0) {
      console.log("لا يوجد توكنات لهذا المستخدم");
      return;
    }

    const token = user.myAppToken;

    const message = {
      notification: {
        title,
        body,
      },
      token: token,
    };

    const response = await admin.messaging().send(message);
  } catch (error) {
    console.error("خطأ أثناء إرسال الإشعار:", error);
  }
};
