import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import FitnessAdvisorPage from './components/FitnessAdvisorPage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavBar />
        <main className="flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<FitnessAdvisorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;