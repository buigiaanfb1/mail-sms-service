import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import twilio from "twilio";
import * as dotenv from "dotenv";
import mustache from "mustache";

const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Alumni Platform Email</title>
</head>
<body style="font-size: 16px; line-height: 1.5; background-color: #f6f6f6; display: flex">
   <div style="width: 600px; margin: 2rem auto">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr style="background: linear-gradient(to right, #7635dc, #01AB55); border: 8px">
            <td style="padding: 20px; color: #fff; text-align: center;">
                <h1 style="margin: 0;">Alumni Platform</h1>
                <p style="margin: 10px 0 0;">Nền tảng kết nối cựu học sinh THPT</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; background-color: #fff; color: #000; font-size: 14px;">
                <p style="color: #000">Chào bạn {{ email }},</p>
                <div style="color: #000">
                    <p style="font-size: 14px; color: #000">{{ content }}</p>
                </div>
                <br/>
                <p style="margin: 0; color: #000">Xin cảm ơn bạn,</p>
                <p style="margin: 0.25rem 0 0 0; font-size: 14px; color: #000">Alumni Team.</p>
            </td>
        </tr>
        <tr style="background: #000; color: #fff">
            <td style="padding: 5px; text-align: center; font-size: 12px">
                <p>ALUMNI PLATFORM &copy; {{ year }}</p>
            </td>
        </tr>
    </table>
   </div>
</body>
</html>
`;
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post(
  "/mail/send-email",
  async (req: express.Request, res: express.Response) => {
    const { to, subject, text } = req.body;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "Gmail",
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_PASS,
      },
    });
    try {
      // Read the email template file
      const data = {
        email: to,
        year: "2023",
        company: "Alumni Platform",
        content: text,
      };
      const rendered = await mustache.render(emailTemplate, data);

      const mailOptions = {
        from: "Alumni Platform <noreply@alumni-platform.com>",
        to,
        subject,
        html: rendered,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send("Email sent successfully");
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

app.post(
  "/sms/send-sms",
  async (req: express.Request, res: express.Response) => {
    const { to, body } = req.body;
    client.messages
      .create({
        body: body,
        to: to,
        from: process.env.TWILIO_PHONE_NUMBER,
      })
      .then((message) => {
        res.status(200).send(`SMS message sent to ${message.to}`);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

app.listen(3001, () => {
  console.log("Server started on port 3001");
});
