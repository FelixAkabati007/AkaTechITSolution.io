import { useState, useEffect } from 'react';

// Simulated sync statuses
const STATUS_TYPES = {
  SYNCED: { id: 'synced', color: 'bg-green-500', label: 'Synced' },
  SYNCING: { id: 'syncing', color: 'bg-yellow-500', label: 'Syncing...' },
  ERROR: { id: 'error', color: 'bg-red-500', label: 'Sync Failed' },
};

export const useSyncStatus = (componentIds) => {
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    // Initialize all as synced
    const initialStatuses = {};
    componentIds.forEach(id => {
      initialStatuses[id] = STATUS_TYPES.SYNCED;
    });
    setStatuses(initialStatuses);

    // Simulate random sync activity
    const interval = setInterval(() => {
      const randomId = componentIds[Math.floor(Math.random() * componentIds.length)];
      const randomEvent = Math.random();

      if (randomEvent > 0.7) {
        // Start syncing
        setStatuses(prev => ({
          ...prev,
          [randomId]: STATUS_TYPES.SYNCING
        }));

        // Finish syncing after delay
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate
          setStatuses(prev => ({
            ...prev,
            [randomId]: success ? STATUS_TYPES.SYNCED : STATUS_TYPES.ERROR
          }));
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [JSON.stringify(componentIds)]);

  return statuses;
};

export const SyncStatusIndicator = ({ status }) => {
  if (!status) return null;

  return (
    <div className="group relative flex items-center justify-center ml-auto">
      <div 
        className={`w-2.5 h-2.5 rounded-full ${status.color} shadow-sm ring-1 ring-white/20 transition-colors duration-300`}
      />
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {status.label}
        {/* Arrow */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
      </div>
    </div>
  );
};
