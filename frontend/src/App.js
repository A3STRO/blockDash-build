import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Portfolio/Dashboard';

// Modern Loading Component
const ModernLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-500 to-accent-600 flex items-center justify-center relative overflow-hidden">
    {/* Floating background elements */}
    <div className="floating-element"></div>
    <div className="floating-element"></div>
    <div className="floating-element"></div>
    
    {/* Main loading content */}
    <div className="glass-card rounded-2xl p-8 text-center animate-fade-in-up">
      <div className="spinner-large mx-auto mb-6"></div>
      <h3 className="text-xl font-semibold text-white mb-2">Loading...</h3>
      <p className="text-white/70">Please wait while we prepare your experience</p>
      
      {/* Loading bar */}
      <div className="mt-6 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white/60 rounded-full shimmer"></div>
      </div>
    </div>
  </div>
);

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <ModernLoader />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <ModernLoader />;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Private Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
