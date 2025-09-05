interface NavigationProps {
  currentView: 'dashboard' | 'calendar' | 'list';
  onViewChange: (view: 'dashboard' | 'calendar' | 'list') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard' as const, label: '📊 Dashboard' },
    { id: 'calendar' as const, label: '📅 Calendar' },
    { id: 'list' as const, label: '📋 All Events' },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${currentView === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}