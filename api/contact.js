/**
 * Vercel Serverless Function: Contact Form Handler
 * 
 * Endpoint: /api/contact
 * Method: POST
 * 
 * This function processes contact form submissions and sends emails via Resend.
 * 
 * Environment Variables Required:
 * - RESEND_API_KEY: Your Resend API key
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Resend: npm install resend
 * 2. Sign up for Resend at https://resend.com
 * 3. Create an API key in your Resend dashboard
 * 4. Add the API key to your Vercel environment variables:
 *    - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
 *    - Add: RESEND_API_KEY = your_resend_api_key_here
 * 5. Verify your domain in Resend or use onboarding@resend.dev for testing
 */

const { Resend } = require('resend');

// In-memory rate limiting store (best effort)
// In production, consider using Redis or Vercel Edge Config for distributed rate limiting
const rateLimitStore = new Map();

// Rate limiting: max 5 requests per IP per 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  // Try various headers that Vercel/proxies might use
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
}

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  // Reset if window has expired
  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment count
  record.count++;
  rateLimitStore.set(ip, record);
  return true;

  // Cleanup old entries periodically (simple approach)
  // In production, use a proper cleanup mechanism
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(req);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      // Silently return success to avoid revealing rate limit
      return res.status(200).json({ 
        message: 'Your message has been sent successfully.' 
      });
    }

    // Parse request body
    const { name, email, company, message, website } = req.body;

    // Honeypot check: if website field is filled, it's spam
    if (website && website.trim() !== '') {
      // Silently reject (return success to avoid revealing honeypot)
      return res.status(200).json({ 
        message: 'Your message has been sent successfully.' 
      });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields.' 
      });
    }

    // Trim and validate
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedCompany = company ? company.trim() : '';

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({ 
        error: 'Missing required fields.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email format.' 
      });
    }

    // Get Resend API key from environment variables
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables');
      console.error('For local development, create a .env.local file with RESEND_API_KEY=your_key');
      console.error('Then run: npx vercel dev');
      return res.status(500).json({ 
        error: 'Failed to send message.',
        details: 'Email service is not configured. RESEND_API_KEY environment variable is missing. For local testing, create a .env.local file and run "npx vercel dev".'
      });
    }

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);

    // Prepare email content
    const emailSubject = `New Contact Inquiry: ${trimmedName} (${trimmedCompany || 'No Company'})`;
    
    // Create email body with all form fields
    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(trimmedName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(trimmedEmail)}</p>
      <p><strong>Company:</strong> ${trimmedCompany ? escapeHtml(trimmedCompany) : 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(trimmedMessage)}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This email was sent from the First Principle Asset Management contact form.</p>
    `;

    // Send email using Resend
    // Use contact@firstprincipleam.com if domain is verified, otherwise onboarding@resend.dev
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: `Contact Form <${fromEmail}>`,
      to: ['team@theinvictuscollective.com'],
      replyTo: trimmedEmail,
      subject: emailSubject,
      html: emailBody,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ 
        error: 'Failed to send message.',
        details: 'There was an error processing your request. Please try again later.'
      });
    }

    // Success response
    return res.status(200).json({ 
      message: 'Your message has been sent successfully.' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send message.',
      details: 'An unexpected error occurred. Please try again later.'
    });
  }
}

/**
 * Helper function to escape HTML and prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
