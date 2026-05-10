import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [journeyType, setJourneyType] = useState(null);
  const [showSOS, setShowSOS] = useState(false);

  return (
    <AppContext.Provider value={{ journeyType, setJourneyType, showSOS, setShowSOS }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
