import { useState } from 'react';
import PhotoAdmin from './PhotoAdmin';
import AdminHeader from './AdminHeader';
import NewsAdmin from './NewsAdmin';
import ExtraNewsAdmin from './ExtraNewsAdmin';
import DonationAdmin from './DonationAdmin';
import SectionAdmin from './SectionAdmin';

import '../styles/AdminPanel.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('news');

  return (
    <div className="admin-layout">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* OFFSET HEADER */}
      <main className="admin-content">
        {activeTab === 'photos' && <PhotoAdmin />}
        {activeTab === 'sections' && <SectionAdmin />}
        {activeTab === 'news' && <NewsAdmin />}
        {activeTab === 'extra-news' && <ExtraNewsAdmin />}
        {activeTab === 'donation' && <DonationAdmin />}    
      </main>
    </div>
  );
}
