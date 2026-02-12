
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tab, BraynerState } from './types';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import PracticeScreen from './screens/PracticeScreen';
import PlanScreen from './screens/PlanScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import SettingsScreen from './screens/SettingsScreen';
import FocusScreen from './screens/FocusScreen';
import VaultScreen from './screens/VaultScreen';
import XPLevelScreen from './screens/XPLevelScreen';
import ProgressReportScreen from './screens/ProgressReportScreen';
import CoachScreen from './screens/CoachScreen';
import AuthScreen from './screens/AuthScreen';
import { getState, isAuthenticated } from './services/localEngine';
import { applyTheme } from './services/settingsService';
import { logout } from './services/authService';

const VALID_TABS: Tab[] = [
  'home', 'practice', 'plan', 'progress', 'profile', 
  'settings', 'focus', 'vault', 'xp', 'report', 'coach'
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [state, setState] = useState<BraynerState>(getState());
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // Global state sync mechanism
  const syncState = useCallback(() => {
    console.log("[BRAYNER] Syncing state and triggering re-render...");
    const fresh = getState();
    setState(fresh);
    setIsAuth(isAuthenticated());
  }, []);

  useEffect(() => {
    applyTheme(state.preferences.theme);
  }, [state.preferences.theme]);

  const navigate = useCallback((tab: Tab) => {
    if (VALID_TABS.includes(tab)) {
      setActiveTab(tab);
      syncState(); 
    } else {
      setActiveTab('home');
    }
  }, [syncState]);

  const handleLogout = async () => {
    await logout();
    syncState();
    setActiveTab('home');
  };

  const handleAuthComplete = () => {
    syncState();
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Memoize screens and inject the state object so they are reactive to changes
  const screens = useMemo(() => [
    { id: 'home', component: <HomeScreen appState={state} setActiveTab={navigate} onUpdate={syncState} /> },
    { id: 'practice', component: <PracticeScreen appState={state} onUpdate={syncState} /> },
    { id: 'plan', component: <PlanScreen appState={state} onNavigate={navigate} onUpdate={syncState} /> },
    { id: 'progress', component: <ProgressScreen appState={state} onNavigate={navigate} /> },
    { id: 'profile', component: <ProfileScreen appState={state} onLogout={handleLogout} onSettingsChange={syncState} onNavigate={navigate} /> },
    { id: 'settings', component: <SettingsScreen appState={state} onBack={() => navigate('profile')} onLanguageChange={syncState} /> },
    { id: 'focus', component: <FocusScreen appState={state} onBack={() => navigate('home')} onUpdate={syncState} /> },
    { id: 'vault', component: <VaultScreen appState={state} onBack={() => navigate('home')} onUpdate={syncState} /> },
    { id: 'xp', component: <XPLevelScreen appState={state} onBack={() => navigate('home')} /> },
    { id: 'report', component: <ProgressReportScreen appState={state} onBack={() => navigate('home')} /> },
    { id: 'coach', component: <CoachScreen appState={state} onBack={() => navigate('home')} /> },
  ], [state, syncState, navigate]);

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
    <Layout activeTab={activeTab} setActiveTab={navigate} appState={state}>
      <div className="relative h-full w-full">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              activeTab === screen.id 
                ? 'opacity-100 z-10 pointer-events-auto' 
                : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="h-full overflow-y-auto hide-scrollbar px-1 pt-2 pb-24 md:pb-12">
              {screen.component}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
