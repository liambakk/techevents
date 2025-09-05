export interface Event {
  id: string;
  fields: {
    'Event Name': string;
    'Event Type': string;
    'Category'?: string[];
    'Date Start': string;
    'Date End': string;
    'Venue': string;
    'Address': string;
    'Format': 'In-Person' | 'Virtual' | 'Hybrid';
    'Cost': number;
    'Cost Type': string;
    'Description': string;
    'Website': string;
    'Registration Link': string;
    'Target Audience'?: string[];
    'Priority': 'Must Attend' | 'High Priority' | 'Medium Priority' | 'Low Priority' | 'Optional';
    'Status': 'Confirmed' | 'Tentative' | 'Cancelled' | 'Postponed' | 'Sold Out';
    'Registration Status'?: string;
    'Notes'?: string;
    'Estimated Attendees'?: number;
  };
}

export interface FilterOptions {
  category?: string;
  eventType?: string;
  costType?: string;
  priority?: string;
  format?: string;
  month?: string;
  searchTerm?: string;
}

export interface DashboardStats {
  totalEvents: number;
  mustAttend: number;
  freeForStudents: number;
  registered: number;
  thisMonth: number;
  upcomingWeek: number;
}