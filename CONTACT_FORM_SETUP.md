# Contact Form Setup Instructions

This document explains how to set up the contact form functionality for the First Principle website.

## Overview

The contact form uses:
- **Frontend**: HTML form with JavaScript validation and submission
- **Backend**: Vercel serverless function (`/api/contact.js`)
- **Email Service**: Resend API (https://resend.com)

## Setup Steps

### 1. Sign up for Resend

1. Go to https://resend.com and create an account
2. Verify your email address
3. Navigate to **API Keys** in the dashboard
4. Create a new API key (name it something like "First Principle Contact Form")
5. Copy the API key (you'll need it in step 3)

### 2. Verify Your Domain (Optional but Recommended)

For production use, you should verify your domain in Resend:
1. Go to **Domains** in the Resend dashboard
2. Add your domain (e.g., `theinvictuscollective.com`)
3. Follow the DNS verification steps
4. Once verified, you can use emails like `noreply@theinvictuscollective.com`

**Note**: If you don't verify a domain, you can use Resend's test domain, but this is only for development.

### 3. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key from step 1
   - **Environment**: Production, Preview, and Development (select all)
4. Click **Save**

### 4. Update Email Configuration

Open `/api/contact.js` and update the following:

1. **From Email Address** (line ~67):
   ```javascript
   from: 'First Principle Contact Form <noreply@theinvictuscollective.com>',
   ```
   - If you verified your domain, use your domain email
   - If not, use Resend's test domain: `onboarding@resend.dev` (development only)

2. **To Email Address** (line ~68):
   ```javascript
   to: ['engage@theinvictuscollective.com'],
   ```
   - This is already set correctly, but verify it's the correct email

3. **CORS Allowed Origins** (lines ~18-23):
   ```javascript
   const allowedOrigins = [
     'https://your-production-domain.com',
     'https://www.your-production-domain.com',
     'http://localhost:3000',
     'http://localhost:5500',
     'http://127.0.0.1:5500'
   ];
   ```
   - Replace with your actual production domain(s)

### 5. Deploy to Vercel

1. Push your changes to your Git repository
2. Vercel will automatically deploy
3. The serverless function will be available at: `https://your-domain.vercel.app/api/contact`

### 6. Test the Form

1. Visit your contact page
2. Fill out the form with test data
3. Submit and verify:
   - Success message appears
   - Email is received at `engage@theinvictuscollective.com`
   - Form resets after successful submission

## Troubleshooting

### Form submission fails

1. **Check browser console** for JavaScript errors
2. **Check Vercel function logs**:
   - Go to Vercel Dashboard > Your Project > Functions
   - Click on `/api/contact` to view logs
3. **Verify environment variable**:
   - Ensure `RESEND_API_KEY` is set in Vercel
   - Redeploy after adding environment variables

### Email not received

1. **Check Resend dashboard** for delivery status
2. **Verify email address** in the function code
3. **Check spam folder**
4. **Verify domain** if using custom domain emails

### CORS errors

1. **Update allowed origins** in `/api/contact.js`
2. **Ensure your domain** is in the `allowedOrigins` array
3. **Redeploy** after making changes

## Security Notes

- ✅ API keys are stored in Vercel environment variables (never exposed to client)
- ✅ CORS is configured to only allow requests from your domain
- ✅ Form validation prevents malicious input
- ✅ Email addresses are validated before sending

## File Structure

```
/
├── api/
│   └── contact.js          # Vercel serverless function
├── contact.html            # Contact form page
├── styles.css              # Form styling
└── CONTACT_FORM_SETUP.md   # This file
```

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Check the Resend dashboard for email delivery status
3. Verify all environment variables are set correctly
4. Ensure your domain is properly configured in Resend

