import { useState, useEffect, useRef } from 'react';
import PhotoAdmin from './PhotoAdmin';
import AdminHeader from './AdminHeader';
import NewsAdmin from './NewsAdmin';
import ExtraNewsAdmin from './ExtraNewsAdmin';
import DonationAdmin from './DonationAdmin';
import FooterAdmin from './FooterAdmin';
import SectionAdmin from './SectionAdmin';
import ChatAdmin from './ChatAdmin';
import AboutAdmin from './AboutAdmin';
import BlogAdmin from './BlogAdmin';

import '../styles/AdminPanel.css';
import '../styles/AdminPanel-Modern.css';
import '../styles/blogAdmin.css';

const TABS = [
  { id: 'chat', label: 'Chat', icon: '' },
  { id: 'photos', label: 'Fotos', icon: '' },
  { id: 'sections', label: 'Secciones', icon: '' },
  { id: 'about', label: 'Acerca de', icon: '' },
  { id: 'news', label: 'Noticias', icon: '' },
  { id: 'blog', label: 'Blog', icon: '' },
  { id: 'extra-news', label: 'Extra', icon: '' },
  { id: 'footer', label: 'Footer', icon: '' },
  { id: 'donation', label: 'Donaciones', icon: '' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('chat');
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false); // Cerrar menú al seleccionar una opción
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatAdmin />;
      case 'photos':
        return <PhotoAdmin />;
      case 'sections':
        return <SectionAdmin />;
      case 'about':
        return <AboutAdmin />;
      case 'news':
        return <NewsAdmin />;
      case 'blog':
        return <BlogAdmin />;
      case 'extra-news':
        return <ExtraNewsAdmin />;
      case 'footer':
        return <FooterAdmin />;
      case 'donation':
        return <DonationAdmin />;
      default:
        return <ChatAdmin />;
    }
  };

  return (
    <div className="admin-layout-modern">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="admin-container">
        {/* SIDEBAR con pestañas vertical */}
        <aside className="admin-sidebar" ref={sidebarRef}>
          {/* Botón hamburguesa (solo visible en mobile) */}
          <button 
            className="admin-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`admin-nav ${menuOpen ? 'active' : ''}`}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                title={tab.label}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-content-modern">
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
