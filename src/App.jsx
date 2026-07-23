import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Nueva landing pública (diseño Lovable)
const LandingHome = React.lazy(() => import('./components/LandingHome.jsx'));
const BlogPage = React.lazy(() => import('./components/BlogPage.jsx'));

// Admin
const AdminPanel = React.lazy(() => import('./admin/AdminPanel.jsx'));
const Login = React.lazy(() => import('./admin/Login.jsx'));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<LandingHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/blog" element={<BlogPage />} />


            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}
