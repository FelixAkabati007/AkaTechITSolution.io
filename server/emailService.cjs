const nodemailer = require("nodemailer");

// Configure transporter
// In production, these should be environment variables
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER || "notifications@akatech.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("---------------------------------------------------");
    console.log(`[Mock Email Service] To: ${to}`);
    console.log(`[Mock Email Service] Subject: ${subject}`);
    console.log(`[Mock Email Service] Body: ${html}`); // Simplified for log
    console.log("---------------------------------------------------");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

const sendLoginNotification = async (email, ip, userAgent) => {
  const subject = "Security Alert: New Admin Login Detected";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>New Admin Login</h2>
      <p>A new login was detected for your administrative account.</p>
      <ul>
        <li><strong>Account:</strong> ${email}</li>
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>IP Address:</strong> ${ip}</li>
        <li><strong>Device:</strong> ${userAgent}</li>
      </ul>
      <p>If this was not you, please contact support immediately.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendInvoiceEmail = async (to, invoiceData, pdfBuffer) => {
  const subject = `Invoice ${invoiceData.referenceNumber} from AkaTech IT Solution`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Invoice Details</h2>
      <p>Dear Customer,</p>
      <p>Please find attached your invoice <strong>${invoiceData.referenceNumber}</strong>.</p>
      <p><strong>Amount Due:</strong> GH₵ ${invoiceData.amount}</p>
      <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
      <p>Thank you for your business.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">AkaTech IT Solution</p>
    </div>
  `;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("---------------------------------------------------");
    console.log(`[Mock Email Service] To: ${to}`);
    console.log(`[Mock Email Service] Subject: ${subject}`);
    console.log(`[Mock Email Service] Attachment: Invoice PDF (${pdfBuffer ? pdfBuffer.length : 0} bytes)`);
    console.log("---------------------------------------------------");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments: [
        {
          filename: `Invoice-${invoiceData.referenceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log(`Invoice email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send invoice email:", error);
  }
};

module.exports = {
  sendEmail,
  sendLoginNotification,
  sendInvoiceEmail,
};
