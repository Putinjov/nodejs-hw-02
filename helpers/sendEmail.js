import sndEmail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const { SENDGRID_API_KEY, SEND_EMAIL_ADDRESS } = process.env
sndEmail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
    const email = { ...data, from: SEND_EMAIL_ADDRESS };
    await sndEmail.send(email);
    return true;
};

export default sendEmail;