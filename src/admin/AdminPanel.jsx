import { useState } from 'react';
import PhotoAdmin from './PhotoAdmin';
import AdminHeader from './AdminHeader';
import NewsAdmin from './NewsAdmin';
import '../styles/AdminPanel.css';

function SettingsEditor() {
  return (
    <div className="admin-module">
      <h2>Editar textos y valores</h2>
      <p>Aquí puedes agregar tu formulario para editar textos del sitio.</p>
    </div>
  );
}

function SectionManager() {
  return (
    <div className="admin-module">
      <h2>Gestión de secciones</h2>
      <p>Aquí puedes agregar tu módulo para administrar secciones dinámicas.</p>
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('photos');

  return (
    <div className="admin-layout">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* OFFSET HEADER */}
      <main className="admin-content">
        {activeTab === 'photos' && <PhotoAdmin />}
        {activeTab === 'settings' && <SettingsEditor />}
        {activeTab === 'sections' && <SectionManager />}
        {activeTab === 'news' && <NewsAdmin />}
      </main>
    </div>
  );
}
