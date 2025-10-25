# Contact Form Backend API

A Node.js Express API for handling contact form submissions with Nodemailer email functionality.

## Features

- 📧 **Dual Email System**: Sends notification to admin and thank you email to user
- 🔒 **Security**: Rate limiting, CORS protection, helmet security headers
- ✉️ **Email Service**: Gmail SMTP with Nodemailer
- 🛡️ **Input Validation**: Comprehensive form validation
- 📊 **Health Check**: API health monitoring endpoint
- 🚀 **Production Ready**: Configured for Render deployment

## API Endpoints

### POST /api/contact
Handles contact form submissions.

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
  "message": "Your message has been sent successfully! I will get back to you soon."
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-10-24T15:30:00.000Z",
  "emailConfigured": true
}
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Server Configuration
PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-domain.vercel.app

# Node Environment
NODE_ENV=production
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the app password in your `.env` file

## Deployment (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `ALLOWED_ORIGINS` (add your deployed frontend URL)
   - `NODE_ENV=production`
3. Deploy!

## Rate Limiting

- 5 submissions per IP per 15 minutes
- Prevents spam and abuse
- Configurable in `server.js`

## Security Features

- Helmet.js security headers
- CORS protection
- Input validation and sanitization
- Rate limiting
- Error handling middleware

## Testing

Test the API locally:

```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message content"
  }'
```

## Monitoring

Check API health:

```bash
curl http://localhost:3001/api/health
```

## Troubleshooting

### Email Not Sending
1. Verify Gmail credentials in `.env`
2. Check if Gmail App Password is correct
3. Ensure 2-factor authentication is enabled
4. Check Gmail security settings

### CORS Errors
1. Verify `ALLOWED_ORIGINS` includes your frontend URL
2. Check that the frontend is making requests to the correct backend URL

### Rate Limiting
- Default: 5 requests per 15 minutes per IP
- Adjust `windowMs` and `max` in `server.js` if needed

## License

MIT License