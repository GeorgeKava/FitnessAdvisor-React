import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import FitnessAdvisorPage from './components/FitnessAdvisorPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
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
              element={user ? <Navigate to="/" /> : <RegisterPage onRegister={handleRegister} />} 
            />
            <Route 
              path="/profile" 
              element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={user ? <FitnessAdvisorPage /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;