'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EventCardMinimal from '@/components/EventCardMinimal';
import DashboardMinimal from '@/components/DashboardMinimal';
import FiltersMinimal from '@/components/FiltersMinimal';
import Calendar from '@/components/Calendar';
import { generateICalContent } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import { Download, LayoutDashboard, CalendarDays, List } from 'lucide-react';
import type { Event, DashboardStats } from '@/types';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    mustAttend: 0,
    freeForStudents: 0,
    registered: 0,
    thisMonth: 0,
    upcomingWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    eventType: '',
    costType: '',
    priority: '',
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch events
  const fetchEvents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.costType) queryParams.append('costType', filters.costType);
      if (filters.priority) queryParams.append('priority', filters.priority);

      const response = await fetch(`/api/events?${queryParams}`);
      const data = await response.json();
      setEvents(data);

      // Fetch stats
      const statsResponse = await fetch('/api/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.category, filters.eventType, filters.costType, filters.priority]);

  // Filter by search term
  useEffect(() => {
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const filtered = events.filter(event =>
        event.fields['Event Name'].toLowerCase().includes(term) ||
        event.fields['Description']?.toLowerCase().includes(term) ||
        event.fields['Venue']?.toLowerCase().includes(term)
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [filters.searchTerm, events]);

  // Export to iCal
  const exportToICal = () => {
    const icalContent = generateICalContent(filteredEvents);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'london-tech-events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Calendar exported successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                London Tech Events
              </h1>
              <span className="text-sm text-muted-foreground">
                Your gateway to tech opportunities
              </span>
            </div>
            
            <Button
              onClick={exportToICal}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Calendar
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FiltersMinimal filters={filters} onFilterChange={setFilters} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-10">
            <TabsTrigger value="dashboard" className="gap-2 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2 text-xs">
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2 text-xs">
              <List className="h-3.5 w-3.5" />
              All Events
            </TabsTrigger>
          </TabsList>

          {/* Dashboard View */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <DashboardMinimal stats={stats} loading={loading} />
            
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">
                Upcoming Events
              </h2>
              
              {loading ? (
                <div className="grid gap-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredEvents.slice(0, 5).map(event => (
                    <EventCardMinimal 
                      key={event.id} 
                      event={event} 
                      onUpdate={fetchEvents}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <div className="bg-card rounded-lg border border-border/40 p-6">
              <Calendar events={filteredEvents} />
            </div>
          </TabsContent>

          {/* All Events View */}
          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="grid gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredEvents.map(event => (
                  <EventCardMinimal 
                    key={event.id} 
                    event={event} 
                    onUpdate={fetchEvents}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}