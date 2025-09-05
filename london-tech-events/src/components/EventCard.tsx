import { motion } from 'framer-motion';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
}

export default function EventCard({ event, onUpdate }: EventCardProps) {
  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'Registration Status': 'Registered' })
      });

      if (response.ok) {
        toast.success('Registration status updated!');
        if (onUpdate) onUpdate();
      }
    } catch (_error) {
      toast.error('Failed to update registration');
    }
  };

  const priorityColors: Record<string, string> = {
    'Must Attend': 'border-l-4 border-red-500',
    'High Priority': 'border-l-4 border-orange-500',
    'Medium Priority': 'border-l-4 border-yellow-500',
    'Low Priority': 'border-l-4 border-blue-500',
    'Optional': 'border-l-4 border-gray-500',
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
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
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
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.fields['Venue']}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${costTypeColors[event.fields['Cost Type']] || 'bg-gray-100 text-gray-800'}`}>
              {event.fields['Cost Type']} {event.fields['Cost'] > 0 && `• £${event.fields['Cost']}`}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {Array.isArray(event.fields['Category']) && event.fields['Category'].slice(0, 3).map((cat, idx) => (
            <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {cat}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleRegister}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Register
          </button>
          <a
            href={event.fields['Website']}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            Details
          </a>
        </div>
      </div>
    </motion.div>
  );
}