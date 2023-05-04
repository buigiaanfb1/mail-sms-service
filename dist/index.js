"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const dotenv = __importStar(require("dotenv"));
const mustache_1 = __importDefault(require("mustache"));
const wait_1 = __importDefault(require("wait"));
const emailTemplate = (content, footerName) => {
    return `
          <!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Alumni Platform Email</title>
                <style>
                  p { margin: 0; }
                </style>
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
                            ${content}
                            <br/>
                            <p style="margin: 0; color: #000">Xin cảm ơn bạn,</p>
                            <p style="margin: 0.25rem 0 0 0; font-size: 14px; color: #000">${footerName ? footerName : "Alumni Team"}</p>
                        </td>
                    </tr>
                    <tr style="background: #000; color: #fff">
                        <td style="padding: 5px; text-align: center; font-size: 12px">
                            <p style="padding: 0.75rem 0;">ALUMNI PLATFORM &copy; {{ year }}</p>
                        </td>
                    </tr>
                </table>
              </div>
            </body>
          </html>
  `;
};
dotenv.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
app.post("/mail/send-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let info;
    let error;
    const { to, subject, text, footerName = null } = req.body;
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "Gmail",
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_PASS,
        },
    });
    // Read the email template file
    const data = {
        email: to,
        year: "2023",
        company: "Alumni Platform",
        content: text,
    };
    const rendered = yield mustache_1.default.render(emailTemplate(data.content, footerName), data);
    const mailOptions = {
        from: "Alumni Platform",
        to,
        subject,
        html: rendered,
    };
    const promiseWrapper = () => new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(info);
        });
    });
    for (let i = 0; i < 3; i++) {
        try {
            info = yield promiseWrapper();
            break;
        }
        catch (e) {
            error = e;
        }
    }
    info
        ? res.status(200).json({ message: "Mail Sent", response: info === null || info === void 0 ? void 0 : info.response })
        : res.status(500).json({ message: "Mail not send", error });
    // await transporter.sendMail(mailOptions);
    // res.status(200).send("Email sent successfully");
}));
app.post("/sms/send-sms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
app.get("/performance/wait-30", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the email template file
        yield (0, wait_1.default)(30000);
        res.status(200).send(`Waited for 30s`);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
app.listen(3001, () => {
    console.log("Server started on port 3001");
});
//# sourceMappingURL=index.js.map