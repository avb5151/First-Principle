/**
 * Vercel Serverless Function: Contact Form Handler
 * 
 * This function processes contact form submissions and sends emails via Resend.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up for Resend at https://resend.com
 * 2. Create an API key in your Resend dashboard
 * 3. Add the API key to your Vercel environment variables:
 *    - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
 *    - Add: RESEND_API_KEY = your_resend_api_key_here
 * 4. Update the 'from' email address below to match your verified domain in Resend
 *    (or use a verified email address from Resend)
 * 
 * SECURITY:
 * - API keys are stored in Vercel environment variables (never exposed to client)
 * - CORS is configured to only allow requests from your domain
 * - Rate limiting can be added if needed
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers - Update allowed origin to match your production domain
  const allowedOrigins = [
    'https://first-principle.vercel.app',
    'https://www.first-principle.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate required fields
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Name, email, and message are required.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format'
      });
    }

    // Get Resend API key from environment variables
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Email service is not configured. Please contact the administrator.'
      });
    }

    // Helper function to escape HTML and prevent XSS
    function escapeHtml(text) {
      if (!text) return '';
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Prepare email content (with HTML escaping for security)
    const emailSubject = `New Contact Form Submission from ${escapeHtml(name)}`;
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedCompany = company ? escapeHtml(company) : '';
    const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');
    
    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapedName}</p>
      <p><strong>Email:</strong> ${escapedEmail}</p>
      ${escapedCompany ? `<p><strong>Company:</strong> ${escapedCompany}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${escapedMessage}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This email was sent from the First Principle Asset Management contact form.</p>
    `;

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'First Principle Contact Form <noreply@theinvictuscollective.com>', // UPDATE: Use your verified domain
        to: ['team@theinvictuscollective.com'],
        subject: emailSubject,
        html: emailBody,
        reply_to: email // Allows direct reply to the sender
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: 'There was an error processing your request. Please try again later.'
      });
    }

    // Success response
    return res.status(200).json({ 
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred. Please try again later.'
    });
  }
}

