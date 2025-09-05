import Airtable from 'airtable';
import type { Event, FilterOptions, DashboardStats } from '@/types';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!
}).base(process.env.AIRTABLE_BASE_ID!);

const eventsTable = base(process.env.AIRTABLE_EVENTS_TABLE_ID || 'Events');

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

      const records = await eventsTable.select({
        filterByFormula: filterFormula,
        sort: [{ field: 'Date Start', direction: 'asc' }],
        maxRecords: 100,
      }).all();

      return records.map(record => ({
        id: record.id,
        fields: record.fields as Event['fields']
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events from Airtable');
    }
  }

  // Get single event by ID
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const record = await eventsTable.find(id);
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
      const record = await eventsTable.update(eventId, {
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
      const record = await eventsTable.create(eventData);
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

      return {
        totalEvents: allEvents.length,
        mustAttend: allEvents.filter(e => e.fields['Priority'] === 'Must Attend').length,
        freeForStudents: allEvents.filter(e => 
          e.fields['Cost Type'] === 'Free for Students' || 
          e.fields['Cost Type'] === 'Free'
        ).length,
        registered: allEvents.filter(e => 
          e.fields['Registration Status'] === 'Registered'
        ).length,
        thisMonth: allEvents.filter(e => {
          const eventDate = new Date(e.fields['Date Start']);
          return eventDate.getMonth() === currentMonth && 
                 eventDate.getFullYear() === currentYear;
        }).length,
        upcomingWeek: allEvents.filter(e => {
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