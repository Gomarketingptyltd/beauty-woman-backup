import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n/index.js';
import './App.css';
import AgeGate from './components/AgeGate/AgeGate';
import AnnouncementBar from './components/AnnouncementBar/AnnouncementBar';
import Chatbot from './components/Chatbot/Chatbot';
import HomePage from './views/HomePage';
import JoinUs from './views/JoinUs';

function safeSession(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function App() {
  const verified = safeSession('on_age_verified') === 'true';
  const [ageOk, setAgeOk] = useState(verified);

  return (
    <HelmetProvider>
      {!ageOk && <AgeGate onEnter={() => setAgeOk(true)} />}
      {ageOk && (
        <div className="App">
          <AnnouncementBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/en" element={<HomePage />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/en/join-us" element={<JoinUs />} />
          </Routes>
          <Chatbot />
        </div>
      )}
    </HelmetProvider>
  );
}

export default App;
