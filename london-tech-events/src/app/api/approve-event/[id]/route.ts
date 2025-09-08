import { NextRequest, NextResponse } from 'next/server';
import { getSubmission, approveSubmission, convertToAirtableFormat } from '@/lib/submissions';
import { AirtableService } from '@/lib/airtable';
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

    // Approve the submission
    const approvedSubmission = await approveSubmission(id, token);
    
    if (!approvedSubmission) {
      return NextResponse.json(
        { success: false, error: 'Failed to approve submission' },
        { status: 500 }
      );
    }

    // Add to Airtable
    try {
      const airtableData = convertToAirtableFormat(approvedSubmission.eventData);
      const newEvent = await AirtableService.createEvent(airtableData);
      
      console.log('Event added to Airtable:', newEvent.id);

      // Send confirmation email to submitter
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

        const confirmationEmail = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Your Event Has Been Approved! 🎉</h2>
            
            <p>Great news! Your event "<strong>${approvedSubmission.eventData.eventName}</strong>" has been approved and is now live on the London Tech Events directory.</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #065f46;">Event Details:</h3>
              <p style="margin: 5px 0;"><strong>Event:</strong> ${approvedSubmission.eventData.eventName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(approvedSubmission.eventData.dateStart).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> ${approvedSubmission.eventData.venue}</p>
            </div>
            
            <p>Your event is now visible to all users browsing our tech events directory. Thank you for contributing to the London tech community!</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              London Tech Events Team
            </p>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"London Tech Events" <events@londontechevents.com>',
          to: approvedSubmission.eventData.submitterEmail,
          subject: `Event Approved: ${approvedSubmission.eventData.eventName}`,
          html: confirmationEmail,
          text: `Your event "${approvedSubmission.eventData.eventName}" has been approved and is now live on the London Tech Events directory.`,
        });

        console.log('Confirmation email sent to:', approvedSubmission.eventData.submitterEmail);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the approval if email fails
      }

      // Return HTML response for browser
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Approved</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 500px;
              text-align: center;
            }
            .success-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: #10b981;
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
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
            }
            .event-details strong {
              color: #374151;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #6366f1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
              font-weight: 600;
            }
            .button:hover {
              background: #4f46e5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Event Approved Successfully!</h1>
            <p>The event has been added to the London Tech Events directory and is now live.</p>
            
            <div class="event-details">
              <p><strong>Event Name:</strong> ${approvedSubmission.eventData.eventName}</p>
              <p><strong>Date:</strong> ${new Date(approvedSubmission.eventData.dateStart).toLocaleDateString()}</p>
              <p><strong>Venue:</strong> ${approvedSubmission.eventData.venue}</p>
              <p><strong>Submitter:</strong> ${approvedSubmission.eventData.submitterEmail}</p>
            </div>
            
            <p style="color: #10b981; font-weight: 600;">
              ✅ Added to Airtable<br>
              ✅ Confirmation email sent to submitter
            </p>
            
            <a href="/" class="button">View All Events</a>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(htmlResponse, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });

    } catch (airtableError) {
      console.error('Failed to add to Airtable:', airtableError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event approved but failed to add to Airtable',
          details: airtableError 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error approving event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve event' },
      { status: 500 }
    );
  }
}