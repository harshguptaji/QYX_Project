import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({
  mobile,
  message,
}) => {
  if (!mobile || !message) {
    throw new Error(
      "Mobile number and message are required."
    );
  }

  const result =
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile,
    });

  return result;
};

export default sendSMS;