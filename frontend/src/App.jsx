import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './styles/logo.css';

import FitnessAdvisorPage from './components/FitnessAdvisorPage';
import DashboardPage from './components/DashboardPage';
import WeeklyPlanPage from './components/WeeklyPlanPage';
import ProgressPage from './components/ProgressPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import VoiceChatWebRTC from './components/VoiceChatWebRTC';
import FoodRecommendationsPage from './components/FoodRecommendationsPage';
import IdentifyFoodPage from './components/IdentifyFoodPage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear general user session data but KEEP user-specific fitness data
    // so it's available when they log back in
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavBar user={user} onLogout={handleLogout} />
        <main className="flex-grow-1 py-4">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <RegisterPage onLogin={handleRegister} />} 
            />
            <Route 
              path="/profile" 
              element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/fitness-advisor" 
              element={user ? <FitnessAdvisorPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/weekly-plan" 
              element={user ? <WeeklyPlanPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/progress" 
              element={user ? <ProgressPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/voice-chat" 
              element={user ? <VoiceChatWebRTC user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/food-recommendations" 
              element={user ? <FoodRecommendationsPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/identify-food" 
              element={user ? <IdentifyFoodPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={user ? <DashboardPage user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;