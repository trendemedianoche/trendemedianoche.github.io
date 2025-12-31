import { useState } from 'react';
import PhotoAdmin from './PhotoAdmin';
import AdminHeader from './AdminHeader';
import NewsAdmin from './NewsAdmin';
import ExtraNewsAdmin from './ExtraNewsAdmin';
import DonationAdmin from './DonationAdmin';
import SectionAdmin from './SectionAdmin';
import ChatAdmin from './ChatAdmin';


import '../styles/AdminPanel.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="admin-layout">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* OFFSET HEADER */}
      <main className="admin-content">
        {activeTab === 'chat' && <ChatAdmin />}
        {activeTab === 'photos' && <PhotoAdmin />}
        {activeTab === 'sections' && <SectionAdmin />}
        {activeTab === 'news' && <NewsAdmin />}
        {activeTab === 'extra-news' && <ExtraNewsAdmin />}
        {activeTab === 'donation' && <DonationAdmin />}    
      </main>
    </div>
  );
}
