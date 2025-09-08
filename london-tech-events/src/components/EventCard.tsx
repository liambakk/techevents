import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {

  const priorityColors: Record<string, string> = {
    'High Priority': 'border-l-4 border-indigo-600',
    'Medium Priority': 'border-l-4 border-gray-500',
    'Low Priority': 'border-l-4 border-gray-400',
    'Optional': 'border-l-4 border-gray-300',
  };

  const costTypeColors: Record<string, string> = {
    'Free': 'bg-green-100 text-green-800',
    'Free for Students': 'bg-emerald-100 text-emerald-800',
    'Paid': 'bg-red-100 text-red-800',
    'Early Bird Available': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${priorityColors[event.fields['Priority']] || ''}`}
    >
      <Link href={`/events/${event.id}`} className="block p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors">
            {event.fields['Event Name']}
          </h3>
          <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            {event.fields['Event Type']}
          </span>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.fields['Date Start'])} • {formatTime(event.fields['Date Start'])}
          </div>
          
          {event.fields['Venue']?.toLowerCase() === 'virtual' ? (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{event.fields['Venue']}</span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.fields['Venue'] + ', ' + (event.fields['Address'] || 'London'))}`, '_blank');
              }}
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="underline decoration-dotted underline-offset-2">
                {event.fields['Venue']}
              </span>
            </button>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${costTypeColors[event.fields['Cost Type']] || 'bg-gray-100 text-gray-800'}`}>
              {event.fields['Cost Type']} {event.fields['Cost'] > 0 && `• £${event.fields['Cost']}`}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {event.fields['Category'] && (() => {
            const category = event.fields['Category'];
            if (typeof category === 'string') {
              return (category as string).split(';').slice(0, 3).map((cat, idx) => (
                <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {cat.trim()}
                </span>
              ));
            } else if (Array.isArray(category)) {
              return (category as string[]).slice(0, 3).map((cat, idx) => (
                <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {cat}
                </span>
              ));
            }
            return null;
          })()}
        </div>

      </Link>
      
      {/* Actions - Outside the Link */}
      <div className="px-6 pb-6">
        <Link
          href={`/events/${event.id}`}
          className="block w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}