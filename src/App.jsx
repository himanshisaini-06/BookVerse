import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ExplorePage from './components/ExplorePage';
import GamesPage from './components/GamesPage'; // 1. Make sure this import is here

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        
        {/* 2. This is the missing line that fixes the blank page */}
        <Route path="/games" element={<GamesPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;