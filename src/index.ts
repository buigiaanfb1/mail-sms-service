import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import twilio from "twilio";
import * as dotenv from "dotenv";

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
        user: "buigiaanfb1@gmail.com",
        pass: "guhlotrnwbxmdlrs",
      },
    });
    const mailOptions = {
      from: "buigiaanfb1@gmail.com",
      to,
      subject,
      text,
    };
    try {
      await transporter.sendMail(mailOptions);
      res.send("Email sent successfully ");
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
        from: "+15177900837",
      })
      .then((message) => {
        res.status(200).send(`SMS message sent to ${message.to}`);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
