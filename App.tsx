
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { TrailArView } from './pages/TrailArView';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// --- Main App Component ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/trail/:id" 
              element={
                <ProtectedRoute>
                  <TrailArView />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
