import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Labour from './pages/Labour';
import Projects from './pages/Projects';
import Notifications from './pages/Notifications';
import { useAuthStore } from './stores/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/materials" 
            element={
              isAuthenticated ? (
                <Materials />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/labour" 
            element={
              isAuthenticated ? (
                <Labour />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/projects" 
            element={
              isAuthenticated ? (
                <Projects />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/notifications" 
            element={
              isAuthenticated ? (
                <Notifications />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;