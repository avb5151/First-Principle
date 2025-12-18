# Contact Form Setup Guide

## Quick Setup for Local Testing

1. **Get a Resend API Key:**
   - Sign up at https://resend.com (free tier available)
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

2. **Create `.env.local` file in the project root:**
   ```bash
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

3. **Run Vercel dev server:**
   ```bash
   npx vercel dev
   ```
   This will start a local server at http://localhost:3000 and load your `.env.local` file.

## Production Setup (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - Key: `RESEND_API_KEY`
   - Value: Your Resend API key
   - Environment: Production, Preview, Development (select all)
4. Redeploy your site

## Testing

- Open http://localhost:3000/contact.html (when using `vercel dev`)
- Fill out the form
- Submit and check that email arrives at `team@theinvictuscollective.com`

## Troubleshooting

**Error: "Email service is not configured"**
- Make sure you've created `.env.local` with your `RESEND_API_KEY`
- Make sure you're running `vercel dev` (not just opening the HTML file directly)
- Verify your API key is correct

**Error: "Failed to send email"**
- Check your Resend dashboard for error logs
- Make sure you've verified your domain in Resend (or use `onboarding@resend.dev`)
