'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EventCardMinimal from '@/components/EventCardMinimal';
import EventListItem from '@/components/EventListItem';
import DashboardMinimal from '@/components/DashboardMinimal';
import FiltersMinimal from '@/components/FiltersMinimal';
import Calendar from '@/components/Calendar';
import ExportCalendarModal from '@/components/ExportCalendarModal';
import SubmitEventModal from '@/components/SubmitEventModal';
import { generateICalContent } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import { Download, LayoutDashboard, CalendarDays, List } from 'lucide-react';
import Image from 'next/image';
import lbsLogo from '@/assets/lbs.png';
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
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [submitEventModalOpen, setSubmitEventModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

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
      
      if (!response.ok) {
        console.error('API error:', data);
        toast.error(data.error || 'Failed to load events');
        setEvents([]);
      } else if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('Invalid response format:', data);
        toast.error('Invalid response from server');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.category, filters.eventType, filters.costType, filters.priority]);

  // Prevent body scroll when calendar tab is active
  useEffect(() => {
    if (activeTab === 'calendar') {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [activeTab]);

  // Handle scroll for header animation with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      // Don't handle scroll when calendar tab is active
      if (activeTab === 'calendar') return;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Determine when to show/hide filters
          if (currentScrollY <= 10) {
            // Always show at top
            setShowFilters(true);
          } else if (currentScrollY < lastScrollY) {
            // Show when scrolling up
            setShowFilters(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
            // Hide when scrolling down past threshold
            setShowFilters(false);
          }
          
          setScrollY(currentScrollY);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, activeTab]);

  // Filter by search term and calculate stats
  useEffect(() => {
    let filtered = events;
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = events.filter(event =>
        event.fields['Event Name'].toLowerCase().includes(term) ||
        event.fields['Description']?.toLowerCase().includes(term) ||
        event.fields['Venue']?.toLowerCase().includes(term)
      );
    }
    
    setFilteredEvents(filtered);
    
    // Calculate stats based on filtered events
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const futureEvents = filtered.filter(e => new Date(e.fields['Date Start']) >= now);
    
    setStats({
      totalEvents: filtered.length,
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
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      }).length,
      upcomingWeek: futureEvents.filter(e => {
        const eventDate = new Date(e.fields['Date Start']);
        return eventDate >= now && eventDate <= oneWeekFromNow;
      }).length,
    });
  }, [filters.searchTerm, events]);

  // Export to iCal (download)
  const downloadICal = () => {
    const icalContent = generateICalContent(filteredEvents);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'london-tech-events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Calendar downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#ffffff',
              border: '1px solid #059669',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#ffffff',
              border: '1px solid #dc2626',
            },
          },
        }}
      />

      {/* Header */}
      <header 
        className={`border-b border-border/40 sticky top-0 z-50 transition-all duration-500 ease-in-out ${
          showFilters 
            ? 'bg-background' 
            : scrollY > 80 
              ? 'bg-background/95 backdrop-blur' 
              : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Image 
                src={lbsLogo} 
                alt="LBS Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Tech Events Directory
                </h1>
                <span className="text-sm text-muted-foreground">
                  Your gateway to tech opportunities
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors mr-2"
                onClick={() => setSubmitEventModalOpen(true)}
              >
                Event not listed?
              </button>
              
              <Button
                onClick={() => setExportModalOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export To Calendar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div 
        className="fixed w-full transition-all duration-500 ease-in-out"
        style={{ 
          zIndex: 40,
          transform: `translateY(${showFilters ? '0' : '-100%'})`,
          opacity: showFilters ? 1 : 0,
          pointerEvents: showFilters ? 'auto' : 'none',
          top: '64px'
        }}
      >
        <FiltersMinimal filters={filters} onFilterChange={setFilters} />
      </div>
      
      {/* Spacer to maintain layout when filters are fixed */}
      <div style={{ 
        height: scrollY <= 10 ? '73px' : '0', 
        transition: 'height 500ms ease-in-out' 
      }} />

      {/* Main Content */}
      <main className={`container mx-auto px-6 py-8 ${activeTab === 'calendar' ? 'h-[calc(100vh-64px)] overflow-hidden' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 h-full flex flex-col">
          <TabsList className="grid w-fit grid-cols-3 h-11">
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
                  {filteredEvents
                    .filter(event => {
                      const eventDate = new Date(event.fields['Date Start']);
                      const now = new Date();
                      const sixWeeksFromNow = new Date(now.getTime() + (6 * 7 * 24 * 60 * 60 * 1000));
                      return eventDate >= now && eventDate <= sixWeeksFromNow;
                    })
                    .sort((a, b) => new Date(a.fields['Date Start']).getTime() - new Date(b.fields['Date Start']).getTime())
                    .slice(0, 10)
                    .map(event => (
                    <EventCardMinimal 
                      key={event.id} 
                      event={event}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6 flex-1 overflow-hidden">
            <div className="bg-card rounded-lg border border-border/40 p-6 h-full">
              <Calendar events={filteredEvents} />
            </div>
          </TabsContent>

          {/* All Events View */}
          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="grid gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredEvents.map(event => (
                  <EventListItem 
                    key={event.id} 
                    event={event}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Export Calendar Modal */}
      <ExportCalendarModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onDownload={downloadICal}
      />

      {/* Submit Event Modal */}
      <SubmitEventModal
        open={submitEventModalOpen}
        onOpenChange={setSubmitEventModalOpen}
      />
    </div>
  );
}