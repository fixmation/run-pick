import { Router } from 'express';
import { MailService } from '@sendgrid/mail';

const router = Router();

// Initialize SendGrid (optional - will work without API key for demo)
let mailService: MailService | null = null;
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Send OTP via email
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, otp } = req.body;

    if (!email || !name || !otp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // If SendGrid is configured, send real email
    if (mailService) {
      const msg = {
        to: email,
        from: 'noreply@runpick.lk', // Replace with your verified sender email
        subject: 'RunPick - Email Verification Code',
        text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nRunPick Team`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f59e0b; margin: 0;">RunPick</h1>
              <p style="color: #666; margin: 5px 0;">Sri Lanka's Premier Multi-Service Platform</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
              <p style="color: #666; margin-bottom: 30px;">Hello ${name},</p>
              <p style="color: #666; margin-bottom: 30px;">Your verification code is:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
                <h1 style="color: #f59e0b; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This code will expire in 10 minutes.<br>
                If you didn't request this code, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                © 2025 RunPick. All rights reserved.<br>
                Sri Lanka's trusted taxi, food delivery, and parcel service.
              </p>
            </div>
          </div>
        `,
      };

      await mailService.send(msg);
      
      res.json({ 
        success: true, 
        message: 'Verification code sent successfully',
        demo: false
      });
    } else {
      // Demo mode - no actual email sent
      console.log(`[DEMO] OTP for ${email}: ${otp}`);
      
      res.json({ 
        success: true, 
        message: 'Demo mode - check console for OTP',
        demo: true,
        otp: otp // Only for demo purposes
      });
    }

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      message: 'Failed to send verification code',
      demo: true,
      otp: req.body.otp // Fallback for demo
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // In a real app, you would:
    // 1. Check OTP against stored value in database/Redis
    // 2. Verify expiration time
    // 3. Mark email as verified
    
    // For demo purposes, we'll accept any 6-digit OTP
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      res.json({ 
        success: true, 
        message: 'Email verified successfully',
        verified: true
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code'
      });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

export default router;