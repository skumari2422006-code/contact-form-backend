# Contact Form Backend

A Node.js Express backend API for handling contact form submissions with email notifications using Nodemailer.

## Features

- 📧 Email notifications to admin
- 🎉 Thank you emails to users
- 🛡️ Input validation and sanitization
- 🚦 Rate limiting protection
- 🔒 Security headers with Helmet
- 🌐 CORS configuration
- ⚡ Error handling
- 📊 Health check endpoint

## Technologies Used

- Node.js
- Express.js
- Nodemailer
- Express Validator
- Helmet
- CORS
- Rate Limiting

## Environment Variables

Create a `.env` file in the root directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=your-email@gmail.com

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### POST /api/contact

Send contact form data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a project with you."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! Check your email for confirmation."
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Email Templates

The backend sends two types of emails:

1. **Admin Notification**: Receives the contact form submission details
2. **User Thank You**: Sends a confirmation email to the user

## Security Features

- Input validation using Express Validator
- Rate limiting (5 requests per 15 minutes per IP)
- Security headers with Helmet
- CORS configuration
- Error handling without exposing sensitive information

## Deployment

This backend is designed to be deployed on platforms like:
- Render
- Heroku
- Vercel Serverless
- DigitalOcean

Make sure to set the environment variables in your hosting platform.

## License

ISC