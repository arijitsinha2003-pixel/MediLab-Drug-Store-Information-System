import React, { useState, useEffect } from 'react';
import { User } from './types';
import { MediLabStore } from './services/storage';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return MediLabStore.getCurrentSession();
  });

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    MediLabStore.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <DashboardLayout user={currentUser} onLogout={handleLogout} />;
}
