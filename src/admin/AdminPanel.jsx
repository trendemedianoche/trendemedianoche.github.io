import { useState } from 'react';
import PhotoAdmin from './PhotoAdmin';
import AdminHeader from './AdminHeader';
import NewsAdmin from './NewsAdmin';
import ExtraNewsAdmin from './ExtraNewsAdmin';
import DonationAdmin from './DonationAdmin';
import SectionAdmin from './SectionAdmin';
import ChatAdmin from './ChatAdmin';
import UserAdmin from './UserAdmin';
import AboutAdmin from './AboutAdmin';

import '../styles/AdminPanel.css';
import '../styles/AdminPanel-Modern.css';

const TABS = [
  { id: 'chat', label: 'Chat', icon: '' },
  { id: 'photos', label: 'Fotos', icon: '' },
  { id: 'sections', label: 'Secciones', icon: '' },
  { id: 'about', label: 'Acerca de', icon: '' },
  { id: 'news', label: 'Noticias', icon: '' },
  { id: 'extra-news', label: 'Extra', icon: '' },
  { id: 'donation', label: 'Donaciones', icon: '' },
  { id: 'users', label: 'Usuarios', icon: '' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('chat');

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
      case 'extra-news':
        return <ExtraNewsAdmin />;
      case 'donation':
        return <DonationAdmin />;
      case 'users':
        return <UserAdmin />;
      default:
        return <ChatAdmin />;
    }
  };

  return (
    <div className="admin-layout-modern">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="admin-container">
        {/* SIDEBAR con pestañas vertical */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
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
