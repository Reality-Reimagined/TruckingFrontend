import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { SignUp } from './components/signup'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<AuthForm />} />
        <Route path="/signup" element ={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;