import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getSiteSections } from './services/siteSectionsService';

// Lazy loading de componentes de secciones
const Header = React.lazy(() => import('./components/Header.jsx'));
const Gallery = React.lazy(() => import('./components/Gallery.jsx'));
const About = React.lazy(() => import('./components/About.jsx'));
const Music = React.lazy(() => import('./components/Music.jsx'));
const Footer = React.lazy(() => import('./components/Footer.jsx'));
const News = React.lazy(() => import('./features/news/News.jsx'));
const ChatWidget = React.lazy(() => import('./components/ChatWidget.jsx'));

// Lazy loading del panel de administración
const AdminPanel = React.lazy(() => import('./admin/AdminPanel.jsx'));

// Mapa de secciones a componentes
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

  useEffect(() => {
    getSiteSections().then(setSections);
  }, []);

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
    <Router>
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <ChatWidget />
      </Suspense>
    </Router>
  );
}
