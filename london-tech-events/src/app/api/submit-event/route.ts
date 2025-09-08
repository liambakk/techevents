import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createSubmission } from '@/lib/submissions';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Store the submission
    const submission = await createSubmission(data);
    
    // Get the base URL for approve/deny links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:3000' 
                     : `https://${request.headers.get('host')}`);
    
    const approveUrl = `${baseUrl}/api/approve-event/${submission.id}?token=${submission.token}`;
    const denyUrl = `${baseUrl}/api/deny-event/${submission.id}?token=${submission.token}`;

    // Format the event data for the email with approve/deny buttons
    const eventDetails = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Event Submission</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Quick Actions</h3>
          <div style="margin: 20px 0;">
            <a href="${approveUrl}" 
               style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
              ✓ Approve Event
            </a>
            <a href="${denyUrl}" 
               style="display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ✗ Deny Event
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 15px;">
            Submission ID: ${submission.id}<br>
            Submitted: ${new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
        
        <h3 style="color: #555;">Event Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Event Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.eventName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Event Type:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.eventType || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Categories:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.category?.join(', ') || 'None'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.dateStart ? new Date(data.dateStart).toLocaleDateString() : 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>End Date:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.dateEnd ? new Date(data.dateEnd).toLocaleDateString() : 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Venue:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.venue}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Address:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.address || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Format:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.format}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Cost:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">£${data.cost || 0} (${data.costType})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.priority}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Est. Attendees:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.estimatedAttendees || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Target Audience:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.targetAudience?.join(', ') || 'Not specified'}</td>
          </tr>
        </table>
        
        <h3 style="color: #555;">Links</h3>
        <p>
          <strong>Website:</strong> ${data.website ? `<a href="${data.website}">${data.website}</a>` : 'Not provided'}<br>
          <strong>Registration:</strong> ${data.registrationLink ? `<a href="${data.registrationLink}">${data.registrationLink}</a>` : 'Not provided'}
        </p>
        
        <h3 style="color: #555;">Description</h3>
        <p style="background: #f9f9f9; padding: 10px; border-radius: 4px;">
          ${data.description || 'No description provided'}
        </p>
        
        ${data.notes ? `
        <h3 style="color: #555;">Additional Notes</h3>
        <p style="background: #f9f9f9; padding: 10px; border-radius: 4px;">
          ${data.notes}
        </p>
        ` : ''}
        
        <h3 style="color: #555;">Submitter Information</h3>
        <p>
          <strong>Name:</strong> ${data.submitterName || 'Not provided'}<br>
          <strong>Email:</strong> <a href="mailto:${data.submitterEmail}">${data.submitterEmail}</a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">Approval Actions:</h4>
          <p style="margin: 5px 0;">
            <strong>Approve:</strong> <a href="${approveUrl}" style="color: #10b981;">${approveUrl}</a>
          </p>
          <p style="margin: 5px 0;">
            <strong>Deny:</strong> <a href="${denyUrl}" style="color: #ef4444;">${denyUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            These links will expire in 7 days for security reasons.
          </p>
        </div>
      </div>
    `;

    // Create a test account if no credentials are provided
    const testAccount = await nodemailer.createTestAccount();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || testAccount.user,
        pass: process.env.SMTP_PASS || testAccount.pass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"London Tech Events" <events@londontechevents.com>',
      to: 'liam@bakk3r.com',
      subject: `New Event Submission: ${data.eventName}`,
      html: eventDetails,
      text: `New Event Submission: ${data.eventName}\n\nApprove: ${approveUrl}\nDeny: ${denyUrl}\n\n${JSON.stringify(data, null, 2)}`,
    });

    console.log('Message sent: %s', info.messageId);
    
    // If using test account, log the preview URL
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return NextResponse.json({
      success: true,
      message: 'Event submitted successfully',
      messageId: info.messageId,
      submissionId: submission.id,
      // Include preview URL if in development
      previewUrl: !process.env.SMTP_HOST ? nodemailer.getTestMessageUrl(info) : undefined,
    });

  } catch (error) {
    console.error('Error submitting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit event' },
      { status: 500 }
    );
  }
}