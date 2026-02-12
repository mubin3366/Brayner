
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tab, BraynerState } from './types.ts';
import Layout from './components/Layout.tsx';
import HomeScreen from './screens/HomeScreen.tsx';
import PracticeScreen from './screens/PracticeScreen.tsx';
import PlanScreen from './screens/PlanScreen.tsx';
import ProgressScreen from './screens/ProgressScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import SplashScreen from './screens/SplashScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import FocusScreen from './screens/FocusScreen.tsx';
import VaultScreen from './screens/VaultScreen.tsx';
import XPLevelScreen from './screens/XPLevelScreen.tsx';
import ProgressReportScreen from './screens/ProgressReportScreen.tsx';
import CoachScreen from './screens/CoachScreen.tsx';
import AuthScreen from './screens/AuthScreen.tsx';
import { getState, isAuthenticated } from './services/localEngine.ts';
import { applyTheme } from './services/settingsService.ts';
import { logout } from './services/authService.ts';

const VALID_TABS: Tab[] = [
  'home', 'practice', 'plan', 'progress', 'profile', 
  'settings', 'focus', 'vault', 'xp', 'report', 'coach'
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [state, setState] = useState<BraynerState>(() => getState());
  const [isAuth, setIsAuth] = useState(() => isAuthenticated());

  useEffect(() => {
    applyTheme(state.preferences.theme);
  }, [state.preferences.theme]);

  const syncState = useCallback(() => {
    const fresh = getState();
    setState(fresh);
    setIsAuth(isAuthenticated());
  }, []);

  const navigate = useCallback((tab: Tab) => {
    if (VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('home');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    syncState();
    setActiveTab('home');
  }, [syncState]);

  const handleAuthComplete = useCallback(() => {
    syncState();
  }, [syncState]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const screens = useMemo(() => ({
    home: <HomeScreen setActiveTab={navigate} />,
    practice: <PracticeScreen />,
    plan: <PlanScreen onNavigate={navigate} />,
    progress: <ProgressScreen onNavigate={navigate} />,
    profile: <ProfileScreen onLogout={handleLogout} onSettingsChange={syncState} onNavigate={navigate} />,
    settings: <SettingsScreen onBack={() => navigate('profile')} onLanguageChange={syncState} />,
    focus: <FocusScreen onBack={() => navigate('home')} />,
    vault: <VaultScreen onBack={() => navigate('home')} />,
    xp: <XPLevelScreen onBack={() => navigate('home')} />,
    report: <ProgressReportScreen onBack={() => navigate('home')} />,
    coach: <CoachScreen onBack={() => navigate('home')} />
  }), [navigate, handleLogout, syncState]);

  useEffect(() => {
    if (isAuth && !VALID_TABS.includes(activeTab)) {
      navigate('home');
    }
  }, [activeTab, navigate, isAuth]);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!isAuth) {
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={navigate}>
      <div className="relative h-full w-full">
        {VALID_TABS.map((tabId) => (
          <div
            key={tabId}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              activeTab === tabId 
                ? 'opacity-100 z-10 pointer-events-auto' 
                : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="h-full overflow-y-auto hide-scrollbar px-1 pt-2 pb-24 md:pb-12">
              {screens[tabId as keyof typeof screens]}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
