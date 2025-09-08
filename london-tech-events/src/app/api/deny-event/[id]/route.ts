import { NextRequest, NextResponse } from 'next/server';
import { getSubmission, denySubmission } from '@/lib/submissions';
import nodemailer from 'nodemailer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 400 }
      );
    }

    // Get the submission
    const submission = await getSubmission(id, token);
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission or token' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          error: `This event has already been ${submission.status}`,
          status: submission.status 
        },
        { status: 400 }
      );
    }

    // Deny the submission
    const deniedSubmission = await denySubmission(id, token);
    
    if (!deniedSubmission) {
      return NextResponse.json(
        { success: false, error: 'Failed to deny submission' },
        { status: 500 }
      );
    }

    // Optionally send denial email to submitter
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || testAccount.user,
          pass: process.env.SMTP_PASS || testAccount.pass,
        },
      });

      const denialEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Event Submission Update</h2>
          
          <p>Thank you for submitting your event "<strong>${deniedSubmission.eventData.eventName}</strong>" to the London Tech Events directory.</p>
          
          <p>After careful review, we were unable to approve this event for inclusion in our directory at this time. This could be due to various reasons such as:</p>
          
          <ul style="color: #666;">
            <li>The event doesn't align with our tech-focused criteria</li>
            <li>Incomplete or unclear event information</li>
            <li>Duplicate event already listed</li>
            <li>Event date has already passed</li>
          </ul>
          
          <p>If you believe this decision was made in error or would like to provide additional information, please feel free to resubmit with updated details.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            London Tech Events Team
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"London Tech Events" <events@londontechevents.com>',
        to: deniedSubmission.eventData.submitterEmail,
        subject: `Event Submission Update: ${deniedSubmission.eventData.eventName}`,
        html: denialEmail,
        text: `Thank you for submitting your event "${deniedSubmission.eventData.eventName}". After review, we were unable to approve this event for our directory at this time.`,
      });

      console.log('Denial notification sent to:', deniedSubmission.eventData.submitterEmail);
    } catch (emailError) {
      console.error('Failed to send denial email:', emailError);
      // Don't fail the denial if email fails
    }

    // Return HTML response for browser
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Denied</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            text-align: center;
          }
          .deny-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 10px;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
          }
          .event-details {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
            border-left: 4px solid #ef4444;
          }
          .event-details strong {
            color: #374151;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #6b7280;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 600;
          }
          .button:hover {
            background: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="deny-icon">✗</div>
          <h1>Event Denied</h1>
          <p>This event submission has been marked as denied and will not be added to the directory.</p>
          
          <div class="event-details">
            <p><strong>Event Name:</strong> ${deniedSubmission.eventData.eventName}</p>
            <p><strong>Date:</strong> ${new Date(deniedSubmission.eventData.dateStart).toLocaleDateString()}</p>
            <p><strong>Venue:</strong> ${deniedSubmission.eventData.venue}</p>
            <p><strong>Submitter:</strong> ${deniedSubmission.eventData.submitterEmail}</p>
          </div>
          
          <p style="color: #ef4444; font-weight: 600;">
            ✓ Submission marked as denied<br>
            ✓ Notification sent to submitter
          </p>
          
          <a href="/" class="button">Back to Home</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error denying event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deny event' },
      { status: 500 }
    );
  }
}