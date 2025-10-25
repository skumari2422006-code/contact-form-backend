const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'https://nirajkrsingh.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email templates
const getEmailTemplates = (formData) => {
  // Admin notification email
  const adminEmail = {
    subject: `New Contact Form Submission: ${formData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; color: #666; font-size: 14px;">You've received a new message from your portfolio website.</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #333;">Name:</strong> ${formData.name}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #333;">Email:</strong> <a href="mailto:${formData.email}" style="color: #007bff;">${formData.email}</a>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #333;">Subject:</strong> ${formData.subject}
        </div>
        
        <div style="margin-bottom: 20px;">
          <strong style="color: #333;">Message:</strong>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${formData.message}</div>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #666;">
          <p style="margin: 0;">This message was sent from your portfolio contact form.</p>
          <p style="margin: 0;">Sent on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  };

  // User thank you email
  const userEmail = {
    subject: `Thank you for contacting me - ${formData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Thank You for Contacting Me!</h1>
          <p style="color: #666; font-size: 16px;">I've received your message and will get back to you soon.</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Your Message Details:</h3>
          <div style="margin-bottom: 10px;">
            <strong style="color: #333;">Name:</strong> ${formData.name}
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #333;">Email:</strong> ${formData.email}
          </div>
          <div style="margin-bottom: 15px;">
            <strong style="color: #333;">Subject:</strong> ${formData.subject}
          </div>
          <div>
            <strong style="color: #333;">Message:</strong>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${formData.message}</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <p style="color: #666; margin-bottom: 10px;">You can expect a response within 24-48 hours.</p>
          <div style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            Reference ID: ${Date.now()}
          </div>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
          <h4 style="color: #333; margin-bottom: 10px;">Connect with me:</h4>
          <div>
            <a href="https://nirajkrsingh.vercel.app" style="color: #007bff; text-decoration: none; margin: 0 10px;">Portfolio</a>
            <a href="https://www.linkedin.com/in/niraj-kumar-singh-116437257/" style="color: #007bff; text-decoration: none; margin: 0 10px;">LinkedIn</a>
            <a href="https://github.com/nirajkumarsingh51" style="color: #007bff; text-decoration: none; margin: 0 10px;">GitHub</a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 15px;">Sent on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  };

  return { adminEmail, userEmail };
};

// Validation middleware
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and dots'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
];

// Contact form endpoint
app.post('/api/contact', validateContactForm, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => error.msg)
      });
    }

    const { name, email, subject, message } = req.body;

    // Get email templates
    const { adminEmail, userEmail } = getEmailTemplates({ name, email, subject, message });

    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      ...adminEmail
    };

    // Send thank you email to user
    const userMailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      replyTo: process.env.EMAIL_TO,
      ...userEmail
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    // Success response
    res.json({
      success: true,
      message: 'Message sent successfully! Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Don't expose detailed error information to client
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contact Form Backend API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Test email configuration on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
});

module.exports = app;