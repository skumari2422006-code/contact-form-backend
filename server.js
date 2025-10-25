const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Validate email configuration
const validateEmailConfig = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Email configuration missing. Please check environment variables.');
    return false;
  }
  return true;
};

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Input validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Check email configuration
    if (!validateEmailConfig()) {
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error'
      });
    }

    const transporter = createTransporter();

    // 1. Email to admin (nirajsingh9570460932@gmail.com)
    const adminEmailContent = {
      from: process.env.GMAIL_USER,
      to: 'nirajsingh9570460932@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
            <h3 style="color: #4f46e5; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #92400e;">
              This message was sent from your portfolio contact form on ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    // 2. Thank you email to the person who submitted the form
    const thankYouEmailContent = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Thank you for contacting me - Niraj Kumar Singh',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4f46e5; margin: 0;">Thank You!</h1>
            <p style="color: #6b7280; margin: 5px 0;">For reaching out to me</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${name},</p>
            <p style="line-height: 1.6;">
              Thank you for taking the time to contact me through my portfolio. I have received your message and will get back to you as soon as possible.
            </p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4 style="color: #4f46e5; margin-top: 0;">Your Message Summary:</h4>
              <p><strong>Subject:</strong> ${subject}</p>
              <p style="white-space: pre-wrap; line-height: 1.6;"><strong>Message:</strong> ${message}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280;">I'll respond to you at: <strong>${email}</strong></p>
          </div>

          <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #4f46e5; margin-top: 0;">About Me</h3>
            <p style="line-height: 1.6;">
              I'm a Full-Stack Developer specializing in modern web technologies. 
              I'm passionate about creating scalable applications and solving complex problems.
            </p>
            <div style="margin-top: 15px;">
              <p>Feel free to connect with me:</p>
              <ul style="list-style: none; padding: 0;">
                <li>📧 Email: nirajsingh9570460932@gmail.com</li>
                <li>💼 LinkedIn: <a href="https://www.linkedin.com/in/niraj-kumar-singh-116437257/" style="color: #4f46e5;">Connect with me</a></li>
                <li>🐙 GitHub: <a href="https://github.com/nirajkumarsingh51" style="color: #4f46e5;">Check my work</a></li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              Sent on ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    // Send both emails
    const [adminEmailResult, thankYouEmailResult] = await Promise.allSettled([
      transporter.sendMail(adminEmailContent),
      transporter.sendMail(thankYouEmailContent),
    ]);

    // Check if both emails were sent successfully
    if (adminEmailResult.status === 'rejected' || thankYouEmailResult.status === 'rejected') {
      console.error('Email sending error:', {
        adminEmail: adminEmailResult.status === 'rejected' ? adminEmailResult.reason.message : 'Success',
        thankYouEmail: thankYouEmailResult.status === 'rejected' ? thankYouEmailResult.reason.message : 'Success'
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! I will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    emailConfigured: validateEmailConfig()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Contact Form Backend API',
    version: '1.0.0',
    endpoints: {
      contact: 'POST /api/contact',
      health: 'GET /api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Contact Form Backend Server running on port ${PORT}`);
  console.log(`📧 Email service: ${validateEmailConfig() ? 'Configured' : 'Not configured'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;