const admin = require("firebase-admin"); // تأكد من أن هذا السطر مضاف
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

    // أخذ أول توكن فقط من المصفوفة
    const token = user.myAppToken[0];

    const message = {
      notification: {
        title,
        body,
      },
      token: token, // توكن واحد فقط
    };

    const response = await admin.messaging().send(message);
    console.log(`تم إرسال الإشعار بنجاح إلى توكن واحد:`, response);
  } catch (error) {
    console.error("خطأ أثناء إرسال الإشعار:", error);
  }
};
