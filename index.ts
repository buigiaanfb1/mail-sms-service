import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/send-email", async (req: express.Request, res: express.Response) => {
  console.log("1");
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

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
