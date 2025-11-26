// Fallback email function for development/testing when SendGrid fails
import { EmailOptions } from './email';

export async function sendEmailFallback(options: EmailOptions) {
  console.log('='.repeat(60));
  console.log('📧 FALLBACK EMAIL (Development Mode)');
  console.log('='.repeat(60));
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log('-'.repeat(60));

  // Extract OTP from HTML if present
  const otpMatch = options.html.match(/(\d{6})/);
  if (otpMatch) {
    console.log(`🔐 OTP CODE: ${otpMatch[1]}`);
    console.log('-'.repeat(60));
  }

  // Log text version if available
  if (options.text) {
    console.log(options.text);
  }

  console.log('='.repeat(60));
  console.log('✅ Fallback email logged successfully');
  console.log('💡 In production, configure SendGrid properly');
  console.log('='.repeat(60));
}

// Send OTP via fallback (console logging)
export async function sendOtpEmailFallback(email: string, name: string, otpCode: string) {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 OTP VERIFICATION EMAIL (DEVELOPMENT MODE)');
  console.log('='.repeat(60));
  console.log(`📧 To: ${email}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🔢 OTP Code: ${otpCode}`);
  console.log(`⏰ Expires: 5 minutes`);
  console.log('='.repeat(60));
  console.log('✅ Email logged to console (SendGrid not available)');
  console.log('💡 For production, configure SENDGRID_API_KEY in .env');
  console.log('='.repeat(60) + '\n');
}
