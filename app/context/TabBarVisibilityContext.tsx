import React, { createContext, useContext, useState } from 'react';

interface TabBarVisibilityContextType {
  isTabBarVisible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export function useTabBarVisibilityContext() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error('useTabBarVisibilityContext must be used within a TabBarVisibilityProvider');
  }
  return context;
}

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const showTabBar = () => setIsTabBarVisible(true);
  const hideTabBar = () => setIsTabBarVisible(false);

  return (
    <TabBarVisibilityContext.Provider
      value={{
        isTabBarVisible,
        showTabBar,
        hideTabBar
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export default TabBarVisibilityProvider;