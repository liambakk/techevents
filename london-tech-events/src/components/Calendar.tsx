import { useState, useRef, useEffect } from 'react';
import type { Event } from '@/types';
import { X, Calendar as CalendarIcon, Clock, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarProps {
  events: Event[];
}

export default function Calendar({ events }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const todayMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleEventClick = (event: Event, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const calendarRect = e.currentTarget.closest('.calendar-container')?.getBoundingClientRect();
    
    if (calendarRect) {
      // Position popup to start from the event element
      setPopupPosition({
        top: rect.top - calendarRect.top,
        left: rect.left - calendarRect.left + rect.width
      });
    }
    setSelectedEvent(event);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.fields['Date Start']);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const weeks = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= lastDayOfMonth || currentDate.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 calendar-container relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={todayMonth}
            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {dayNames.map(day => (
          <div key={day} className="bg-gray-50 p-3 text-center font-semibold text-gray-700">
            {day}
          </div>
        ))}
        
        {weeks.map((week, weekIndex) => (
          week.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  relative bg-white p-2 min-h-[100px]
                  ${!isCurrentMonth ? 'bg-gray-50' : ''}
                  ${isToday ? 'bg-blue-50' : ''}
                `}
              >
                {isToday && (
                  <div className="absolute inset-0 ring-2 ring-blue-600 ring-inset pointer-events-none rounded-sm"></div>
                )}
                <div className={`font-medium mb-1 ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'} ${isToday ? 'text-blue-700' : ''}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                      title={event.fields['Event Name']}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.fields['Event Name']}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ))}
      </div>

      {/* Event Popup */}
      {selectedEvent && (
        <>
          <style>{`
            @keyframes slideOutFromEvent {
              from {
                opacity: 0;
                transform: scaleX(0.2) scaleY(0.4) translateX(-10px);
              }
              to {
                opacity: 1;
                transform: scaleX(1) scaleY(1) translateX(8px);
              }
            }
            .event-popup-slide {
              animation: slideOutFromEvent 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
              transform-origin: left center;
            }
          `}</style>
          <div
            ref={popupRef}
            className="absolute z-50 w-96 event-popup-slide"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
            }}
          >
            <div className="bg-background border border-l-4 border-l-blue-600 rounded-lg shadow-xl p-6 relative overflow-hidden">
            {/* Add a small triangle/arrow pointing to the event */}
            <div 
              className="absolute -left-2 top-3 w-0 h-0"
              style={{
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid hsl(var(--border))'
              }}
            />
            <div 
              className="absolute -left-[7px] top-3 w-0 h-0"
              style={{
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid hsl(var(--background))'
              }}
            />
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold leading-none tracking-tight pr-2">
                {selectedEvent.fields['Event Name']}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1 -mr-2"
                onClick={() => setSelectedEvent(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {selectedEvent.fields['Date Start'] && (
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    {new Date(selectedEvent.fields['Date Start']).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              {selectedEvent.fields['Time'] && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{selectedEvent.fields['Time']}</span>
                </div>
              )}
              
              {selectedEvent.fields['Location'] && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="line-clamp-2">{selectedEvent.fields['Location']}</span>
                </div>
              )}
              
              {selectedEvent.fields['Event Type'] && (
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Badge variant="secondary">
                    {selectedEvent.fields['Event Type']}
                  </Badge>
                </div>
              )}
              
              <div className="pt-3 mt-3 border-t">
                <Button
                  asChild
                  className="w-full"
                  size="sm"
                >
                  <a href={`/events/${selectedEvent.id}`}>
                    View Event
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}