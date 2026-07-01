import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    // 🔥 Using Gmail (or any SMTP service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Your email
        pass: process.env.EMAIL_PASS   // App password
      }
    });

    const mailOptions = {
      from: `AI Task Manager <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', options.email);
    
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};
