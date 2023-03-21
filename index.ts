import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import twilio from "twilio";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const accountSid = "AC22d38bf92999df8ced96a0c869b5d027";
const authToken = "2dc8c97a68b8890cb4a6fbba7232be17";
const client = twilio(accountSid, authToken);

app.post("/send-email", async (req: express.Request, res: express.Response) => {
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
    res.send("Email sent successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/send-sms", async (req: express.Request, res: express.Response) => {
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
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
