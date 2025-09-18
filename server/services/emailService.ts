// Email service for sending commission reminders and notifications
export async function sendEmail(to: string, subject: string, message: string): Promise<boolean> {
  try {
    // In a real application, you would integrate with SendGrid, AWS SES, or another email service
    // For now, we'll log the email content
    console.log('📧 Email sent:', {
      to,
      subject,
      message,
      timestamp: new Date().toISOString()
    });
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}