import crypto from 'crypto';
import { AirtableSubmissionsService } from './airtable';

export interface EventSubmission {
  id: string;
  token: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
  approvedAt?: string;
  deniedAt?: string;
  airtableId?: string;
  eventData: {
    eventName: string;
    eventType: string;
    category: string[];
    dateStart: string;
    dateEnd?: string;
    venue: string;
    address: string;
    format: 'In-Person' | 'Virtual' | 'Hybrid';
    cost: number;
    costType: string;
    description: string;
    website?: string;
    registrationLink?: string;
    targetAudience: string[];
    priority: string;
    estimatedAttendees?: number;
    notes?: string;
    submitterName: string;
    submitterEmail: string;
  };
}

// Store submissions in Airtable (works on Vercel serverless)
// Note: We keep a simple in-memory cache for the current session
const submissionsCache: Map<string, EventSubmission> = new Map();

// Create a new submission
export async function createSubmission(eventData: EventSubmission['eventData']): Promise<EventSubmission> {
  const newSubmission: EventSubmission = {
    id: crypto.randomBytes(16).toString('hex'),
    token: crypto.randomBytes(32).toString('hex'),
    status: 'pending',
    submittedAt: new Date().toISOString(),
    eventData
  };
  
  try {
    // Save to Airtable
    const result = await AirtableSubmissionsService.createSubmission({
      id: newSubmission.id,
      token: newSubmission.token,
      status: newSubmission.status,
      submittedAt: newSubmission.submittedAt,
      eventData: newSubmission.eventData
    });
    
    // Store in cache with Airtable ID for future updates
    submissionsCache.set(newSubmission.id, {
      ...newSubmission,
      airtableId: result.airtableId
    });
    
    return newSubmission;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw new Error('Failed to save submission');
  }
}

// Get submission by ID and token
export async function getSubmission(id: string, token: string): Promise<EventSubmission | null> {
  try {
    // Check cache first
    const cached = submissionsCache.get(id);
    if (cached && cached.token === token) {
      return cached;
    }
    
    // Fetch from Airtable
    const submission = await AirtableSubmissionsService.getSubmission(id, token);
    if (!submission) {
      return null;
    }
    
    // Convert and cache
    const result: EventSubmission = {
      id: submission.id,
      token: submission.token,
      status: submission.status as 'pending' | 'approved' | 'denied',
      submittedAt: submission.submittedAt,
      approvedAt: submission.approvedAt,
      deniedAt: submission.deniedAt,
      eventData: submission.eventData,
      airtableId: submission.airtableId
    };
    
    submissionsCache.set(id, result);
    return result;
  } catch (error) {
    console.error('Error fetching submission:', error);
    return null;
  }
}

// Approve a submission
export async function approveSubmission(id: string, token: string): Promise<EventSubmission | null> {
  try {
    // Get the submission first
    const submission = await getSubmission(id, token);
    if (!submission || submission.status !== 'pending') {
      return null;
    }
    
    const timestamp = new Date().toISOString();
    
    // Update in Airtable
    const airtableId = (submission as any).airtableId || submissionsCache.get(id)?.airtableId;
    if (!airtableId) {
      console.error('No Airtable ID found for submission');
      return null;
    }
    
    await AirtableSubmissionsService.updateSubmissionStatus(airtableId, 'approved', timestamp);
    
    // Update cache
    submission.status = 'approved';
    submission.approvedAt = timestamp;
    submissionsCache.set(id, submission);
    
    return submission;
  } catch (error) {
    console.error('Error approving submission:', error);
    return null;
  }
}

// Deny a submission
export async function denySubmission(id: string, token: string): Promise<EventSubmission | null> {
  try {
    // Get the submission first
    const submission = await getSubmission(id, token);
    if (!submission || submission.status !== 'pending') {
      return null;
    }
    
    const timestamp = new Date().toISOString();
    
    // Update in Airtable
    const airtableId = (submission as any).airtableId || submissionsCache.get(id)?.airtableId;
    if (!airtableId) {
      console.error('No Airtable ID found for submission');
      return null;
    }
    
    await AirtableSubmissionsService.updateSubmissionStatus(airtableId, 'denied', timestamp);
    
    // Update cache
    submission.status = 'denied';
    submission.deniedAt = timestamp;
    submissionsCache.set(id, submission);
    
    return submission;
  } catch (error) {
    console.error('Error denying submission:', error);
    return null;
  }
}

// Convert submission data to Airtable format
export function convertToAirtableFormat(eventData: EventSubmission['eventData']) {
  return {
    'Event Name': eventData.eventName,
    'Event Type': eventData.eventType,
    'Category': eventData.category,
    'Date Start': eventData.dateStart,
    'Date End': eventData.dateEnd || eventData.dateStart,
    'Venue': eventData.venue,
    'Address': eventData.address,
    'Format': eventData.format,
    'Cost': eventData.cost,
    'Cost Type': eventData.costType,
    'Description': eventData.description,
    'Website': eventData.website || '',
    'Registration Link': eventData.registrationLink || '',
    'Target Audience': eventData.targetAudience,
    'Priority': eventData.priority as 'High Priority' | 'Medium Priority' | 'Low Priority' | 'Optional',
    'Status': 'Confirmed' as 'Confirmed' | 'Tentative' | 'Cancelled' | 'Postponed' | 'Sold Out',
    'Estimated Attendees': eventData.estimatedAttendees,
    'Notes': `Submitted by: ${eventData.submitterName} (${eventData.submitterEmail})\n${eventData.notes || ''}`
  };
}