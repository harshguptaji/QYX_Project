import "dotenv/config";
import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD
  ) {
    throw new Error(
      "SMTP configuration is missing. Check the .env file."
    );
  }

  if (!transporter) {
    transporter =
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure:
          SMTP_SECURE === "true",

        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });
  }

  return transporter;
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  if (!to || !subject) {
    throw new Error(
      "Email recipient and subject are required."
    );
  }

  const mailTransporter =
    getTransporter();

  const result =
    await mailTransporter.sendMail({
      from: {
        name:
          process.env.EMAIL_FROM_NAME ||
          "QYX Med Tech",

        address:
          process.env
            .EMAIL_FROM_ADDRESS ||
          process.env.SMTP_USER,
      },

      to,
      subject,
      text,
      html,
    });

  return result;
};

export default sendEmail;