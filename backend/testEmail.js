import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== EMAIL TEST ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set (length: ' + process.env.EMAIL_PASS.length + ')' : '❌ Not set');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('\n📧 Sending test email...');

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: '✅ Test Email - AI Task Manager',
  html: `
    <h1>Success! 🎉</h1>
    <p>Your email configuration is working correctly.</p>
    <p>You can now send team invitations.</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
  `
}, (error, info) => {
  if (error) {
    console.error('\n❌ Email failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.error('\n🔧 FIX: Generate new App Password');
      console.error('1. Go to: https://myaccount.google.com/apppasswords');
      console.error('2. Generate new password');
      console.error('3. Update EMAIL_PASS in .env');
    }
    
    if (error.message.includes('Username and Password not accepted')) {
      console.error('\n🔧 FIX: Enable 2-Step Verification');
      console.error('1. Go to: https://myaccount.google.com/security');
      console.error('2. Enable 2-Step Verification');
      console.error('3. Then generate App Password');
    }
  } else {
    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', process.env.EMAIL_USER);
  }
  
  process.exit(error ? 1 : 0);
});
