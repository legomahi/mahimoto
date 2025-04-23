import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import CaseStudyTemplate from './pages/case-studies/CaseStudyTemplate';
import About from './pages/About';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/:slug" element={<CaseStudyTemplate />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 