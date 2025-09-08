import { motion } from 'framer-motion';
import EventCard from './EventCard';
import type { Event, DashboardStats } from '@/types';

interface DashboardProps {
  events: Event[];
  stats: DashboardStats | null;
}

export default function Dashboard({ events, stats }: DashboardProps) {
  const now = new Date();
  const sixWeeksFromNow = new Date(now.getTime() + (6 * 7 * 24 * 60 * 60 * 1000)); // 6 weeks in milliseconds
  
  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.fields['Date Start']);
      return eventDate >= now && eventDate <= sixWeeksFromNow;
    })
    .slice(0, 6);

  const mustAttendEvents = events
    .filter(e => e.fields['Priority'] === 'High Priority' && new Date(e.fields['Date Start']) >= new Date())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            color="from-blue-400 to-blue-600"
            icon="📅"
          />
          <StatCard
            title="High Priority"
            value={stats.mustAttend}
            color="from-indigo-500 to-indigo-700"
            icon="⭐"
          />
          <StatCard
            title="Free for Students"
            value={stats.freeForStudents}
            color="from-green-400 to-green-600"
            icon="🎓"
          />
        </div>
      )}

      {/* High Priority Section */}
      {mustAttendEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 High Priority Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mustAttendEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, color, icon }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );
}