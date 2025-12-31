import React, { useEffect, useState, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import { getSiteSections } from './services/siteSectionsService';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading secciones
const Header = React.lazy(() => import('./components/Header.jsx'));
const Gallery = React.lazy(() => import('./components/Gallery.jsx'));
const About = React.lazy(() => import('./components/About.jsx'));
const Music = React.lazy(() => import('./components/Music.jsx'));
const Footer = React.lazy(() => import('./components/Footer.jsx'));
const News = React.lazy(() => import('./features/news/News.jsx'));
const ChatWidget = React.lazy(() => import('./components/ChatWidget.jsx'));

// Admin
const AdminPanel = React.lazy(() => import('./admin/AdminPanel.jsx'));
const Login = React.lazy(() => import('./admin/Login.jsx'));

// Mapa dinámico
const SECTION_COMPONENTS = {
  header: Header,
  gallery: Gallery,
  about: About,
  music: Music,
  news: News,
  footer: Footer,
  chat: ChatWidget
};

function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSections().then(data => {
      setSections(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Cargando sitio...</div>;

  return (
    <>
      {sections.map((key, index) => {
        const Component = SECTION_COMPONENTS[key];
        return Component ? <Component key={key + index} /> : null;
      })}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

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
      </Router>
    </AuthProvider>
  );
}
