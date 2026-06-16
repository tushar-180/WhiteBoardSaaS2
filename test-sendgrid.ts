/* eslint-disable @typescript-eslint/no-explicit-any */
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("No API KEY");
    return;
  }
  sgMail.setApiKey(apiKey);

  const rawFrom = process.env.SENDGRID_FROM_EMAIL || "test@example.com";
  console.log("Raw from:", rawFrom);
  const cleanFrom = rawFrom.replace(/["']/g, "").trim();
  const match = cleanFrom.match(/^(.*?)\s*<(.+?)>$/);
  let fromObj: any = cleanFrom;
  if (match) {
    fromObj = {
      name: match[1].trim(),
      email: match[2].trim(),
    };
  }
  console.log("Parsed from:", fromObj);

  const msg = {
    to: "tushar.m@empiricinfotech.com", // testing to yourself
    from: fromObj,
    subject: "Test",
    html: "<h1>Test</h1>",
  };

  try {
    const res = await sgMail.send(msg);
    console.log("Success:", res[0].statusCode);
  } catch (error: any) {
    console.error("Failed to send email via SendGrid:", error.message);
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2));
    }
  }
}

run();
