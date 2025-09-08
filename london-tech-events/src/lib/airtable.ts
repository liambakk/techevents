import Airtable from 'airtable';
import type { Event, FilterOptions, DashboardStats } from '@/types';

// Initialize Airtable - defer validation to runtime
const getBase = () => {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not configured');
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not configured');
  }
  
  return new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY.trim()
  }).base(process.env.AIRTABLE_BASE_ID.trim());
};

const getEventsTable = () => {
  const base = getBase();
  return base(process.env.AIRTABLE_EVENTS_TABLE_ID || 'Events');
};

const getSubmissionsTable = () => {
  const base = getBase();
  return base(process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || 'Submissions');
};

export class AirtableService {
  // Fetch all events with optional filters
  static async getEvents(filters?: FilterOptions): Promise<Event[]> {
    try {
      let filterFormula = '';
      const filterParts: string[] = [];

      if (filters?.category) {
        filterParts.push(`FIND('${filters.category}', {Category})`);
      }
      if (filters?.eventType) {
        filterParts.push(`{Event Type} = '${filters.eventType}'`);
      }
      if (filters?.priority) {
        filterParts.push(`{Priority} = '${filters.priority}'`);
      }
      if (filters?.costType) {
        filterParts.push(`{Cost Type} = '${filters.costType}'`);
      }

      if (filterParts.length > 0) {
        filterFormula = `AND(${filterParts.join(', ')})`;
      }

      const records = await getEventsTable().select({
        filterByFormula: filterFormula,
        sort: [{ field: 'Date Start', direction: 'asc' }],
      }).all();

      return records.map(record => ({
        id: record.id,
        fields: record.fields as Event['fields']
      }));
    } catch (error) {
      console.error('Error fetching events from Airtable:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        apiKey: process.env.AIRTABLE_API_KEY ? 'Set (length: ' + process.env.AIRTABLE_API_KEY.length + ')' : 'Not set',
        baseId: process.env.AIRTABLE_BASE_ID ? 'Set' : 'Not set',
        tableId: process.env.AIRTABLE_EVENTS_TABLE_ID || 'Using default: Events'
      });
      throw new Error(`Failed to fetch events from Airtable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get single event by ID
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const record = await getEventsTable().find(id);
      return {
        id: record.id,
        fields: record.fields as Event['fields']
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  // Update event registration status
  static async updateRegistrationStatus(
    eventId: string, 
    status: string
  ): Promise<Event | null> {
    try {
      const record = await getEventsTable().update(eventId, {
        'Registration Status': status
      });
      return {
        id: record.id,
        fields: record.fields as Event['fields']
      };
    } catch (error) {
      console.error('Error updating registration:', error);
      throw new Error('Failed to update registration status');
    }
  }

  // Add new event
  static async createEvent(eventData: Partial<Event['fields']>): Promise<Event> {
    try {
      const record = await getEventsTable().create(eventData);
      return {
        id: record.id,
        fields: record.fields as Event['fields']
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const allEvents = await this.getEvents();
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Filter to only future events for most stats
      const futureEvents = allEvents.filter(e => new Date(e.fields['Date Start']) >= now);

      return {
        totalEvents: allEvents.length,
        mustAttend: futureEvents.filter(e => e.fields['Priority'] === 'High Priority').length,
        freeForStudents: futureEvents.filter(e => 
          e.fields['Cost Type'] === 'Free for Students' || 
          e.fields['Cost Type'] === 'Free'
        ).length,
        registered: futureEvents.filter(e => 
          e.fields['Registration Status'] === 'Registered'
        ).length,
        thisMonth: futureEvents.filter(e => {
          const eventDate = new Date(e.fields['Date Start']);
          return eventDate.getMonth() === currentMonth && 
                 eventDate.getFullYear() === currentYear &&
                 eventDate >= now;
        }).length,
        upcomingWeek: futureEvents.filter(e => {
          const eventDate = new Date(e.fields['Date Start']);
          return eventDate >= now && eventDate <= oneWeekFromNow;
        }).length,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }
}

// Submissions Service for storing event submissions in Airtable
export class AirtableSubmissionsService {
  // Create a new submission
  static async createSubmission(submissionData: {
    id: string;
    token: string;
    status: string;
    submittedAt: string;
    eventData: any;
  }): Promise<any> {
    try {
      // Create record without date field if it's causing issues
      // The date can be tracked in the Event Data JSON
      const recordData: any = {
        'Submission ID': submissionData.id,
        'Token': submissionData.token,
        'Status': submissionData.status,
        'Event Data': JSON.stringify({
          ...submissionData.eventData,
          submittedAt: submissionData.submittedAt
        }),
      };
      
      // Add Submitted At in YYYY-MM-DD format (Airtable date field requirement)
      const today = new Date();
      recordData['Submitted At'] = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const record = await getSubmissionsTable().create(recordData);
      return {
        id: recordData['Submission ID'],
        airtableId: (record as any).id || recordData['Submission ID'],
      };
    } catch (error) {
      console.error('Error creating submission in Airtable:', error);
      throw new Error(`Failed to create submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get submission by ID and token
  static async getSubmission(id: string, token: string): Promise<any | null> {
    try {
      const records = await getSubmissionsTable().select({
        filterByFormula: `AND({Submission ID} = '${id}', {Token} = '${token}')`,
        maxRecords: 1,
      }).all();

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      return {
        id: record.get('Submission ID'),
        token: record.get('Token'),
        status: record.get('Status'),
        submittedAt: record.get('Submitted At'),
        approvedAt: record.get('Approved At'),
        deniedAt: record.get('Denied At'),
        eventData: JSON.parse(record.get('Event Data') as string),
        airtableId: record.id,
      };
    } catch (error) {
      console.error('Error fetching submission from Airtable:', error);
      return null;
    }
  }

  // Update submission status
  static async updateSubmissionStatus(
    airtableId: string, 
    status: 'approved' | 'denied',
    timestamp: string
  ): Promise<any> {
    try {
      const updateData: any = {
        'Status': status,
      };
      
      if (status === 'approved') {
        updateData['Approved At'] = new Date(timestamp).toISOString().split('T')[0];
      } else if (status === 'denied') {
        updateData['Denied At'] = new Date(timestamp).toISOString().split('T')[0];
      }

      const record = await getSubmissionsTable().update(airtableId, updateData);
      return {
        id: record.get('Submission ID'),
        status: record.get('Status'),
      };
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw new Error(`Failed to update submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all submissions (for admin purposes)
  static async getAllSubmissions(): Promise<any[]> {
    try {
      const records = await getSubmissionsTable().select({
        sort: [{ field: 'Submitted At', direction: 'desc' }],
      }).all();

      return records.map(record => ({
        id: record.get('Submission ID'),
        status: record.get('Status'),
        submittedAt: record.get('Submitted At'),
        eventData: JSON.parse(record.get('Event Data') as string),
        airtableId: record.id,
      }));
    } catch (error) {
      console.error('Error fetching all submissions:', error);
      return [];
    }
  }
}