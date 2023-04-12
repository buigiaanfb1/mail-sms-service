import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import twilio from "twilio";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import mustache from "mustache";
import path from "path";

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
      const currentDir = path.resolve(__dirname);
      const templatePath = path.join(currentDir, "template.html");
      const html = readFileSync(templatePath, "utf-8");
      const data = {
        email: to,
        year: "2023",
        company: "Alumni Platform",
        content: text,
      };
      const rendered = await mustache.render(html, data);

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
