const nodemailer = require("nodemailer");

module.exports.Send_Email = async (email, code, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nouralgmal123@gmail.com",
      pass: "xhzv gwqx dvjb lxay",
    },
  });

  const info = await transporter.sendMail({
    from: '"Project" <nouralgmal123@gmail.com>',
    to: email,
    subject: "Account Verification",
    text: "Please use the verification code to activate your account.",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #4a90e2;
          }
          .code-display {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            text-align: center;
            margin: 20px 0;
          }
          .verify-button, .delete-button {
            display: block;
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
          }
          .verify-button {
            background-color: #4a90e2;
          }
          .delete-button {
            background-color: #ff4d4d;
          }
        </style>
      </head>
      <body>
  <div class="container">
    <h2>Account Verification</h2>
    <p>Use the verification code below to activate your account:</p>
    <div class="code-display">${code}</div>
    ${
      token != ""
        ? `
          <p>If you did not initiate this registration, you can delete the account:</p>
          <a href="${process.env.URL}Verification/${token}" class="delete-button">Delete Account</a>
          `
        : ""
    }
    
  </div>
</body>

      </html>
    `,
  });
};

module.exports.Notifications = async (email, name, phone) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nouralgmal123@gmail.com",
      pass: "xhzv gwqx dvjb lxay",
    },
  });

  const info = await transporter.sendMail({
    from: '"Project" <nouralgmal123@gmail.com>',
    to: email,
    subject: "missing Notifications",
    text: "Please use the verification code to activate your account.",
    html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matched Post</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #4a90e2;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    table th {
      background-color: #4a90e2;
      color: #fff;
    }
    .note {
      margin-top: 20px;
      color: #333;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Matched Post</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone Number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${name}</td>
          <td>${phone}</td>
        </tr>
      </tbody>
    </table>

    <p class="note">The post you uploaded has been successfully matched.</p>
  </div>
</body>
</html>

    `,
  });
};
