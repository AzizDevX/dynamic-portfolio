import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import HomeData from "../models/HomeDataSchema.js";
dotenv.config();

const Router = express.Router();
const resend = new Resend(process.env.RESEND_API);
const AdminMail = process.env.ADMIN_MAIL;

async function getEmailTemplate({ fullname, address, subject, message }) {
  const adminDoc = await HomeData.findOne();
  const AdminName = adminDoc?.DisplayName || "Admin";
  const templatePath = path.join(
    process.cwd(),
    "EmailTemplate",
    "emailTemplate.html"
  );

  let template = fs.readFileSync(templatePath, "utf-8");

  template = template
    .replace("{{AdminName}}", AdminName)
    .replace("{{fullname}}", fullname)
    .replace("{{email}}", address)
    .replace("{{subject}}", subject)
    .replace("{{message}}", message)
    .replace("{{year}}", new Date().getFullYear());

  return template;
}

Router.post("/contact", async (req, res) => {
  try {
    if (!resend) {
      console.error("ContactRouter: Missing Resend API config");
      return res.status(500).json({ message: "Incomplete configuration" });
    }

    if (!AdminMail) {
      console.error("ContactRouter: Missing Admin email");
      return res.status(500).json({ message: "Incomplete configuration" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "Invalide Request" });
    }
    const { fullname, address, subject, message } = req.body;

    if (!fullname || !address || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (message.length < 10) {
      return res
        .status(400)
        .json({ error: "Message must be at least 10 characters long" });
    }

    const htmlContent = await getEmailTemplate({
      fullname,
      address,
      subject,
      message,
    });

    const { data, error } = await resend.emails.send({
      from: `Contact Form <${AdminMail}>`,
      to: AdminMail,
      subject: subject,
      reply_to: address,
      html: htmlContent,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("ContactRouter error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default Router;
