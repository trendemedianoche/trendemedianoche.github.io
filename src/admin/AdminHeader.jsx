import { supabase } from '../lib/supabase';
import '../styles/AdminHeader.css';

export default function AdminHeader({ activeTab, setActiveTab, role }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/#/login';
  };

  return (
    <header className="admin-header">
      <div className="admin-left">
        <h1>Admin · Tren de Medianoche</h1>

        <nav>
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>

          <button
            className={activeTab === 'photos' ? 'active' : ''}
            onClick={() => setActiveTab('photos')}
          >
            Fotos
          </button>

          <button
            className={activeTab === 'sections' ? 'active' : ''}
            onClick={() => setActiveTab('sections')}
          >
            Secciones
          </button>

          <button
            className={activeTab === 'news' ? 'active' : ''}
            onClick={() => setActiveTab('news')}
          >
            Noticias
          </button>

          <button
            className={activeTab === 'extra-news' ? 'active' : ''}
            onClick={() => setActiveTab('extra-news')}
          >
            Extra
          </button>

          <button
            className={activeTab === 'donation' ? 'active' : ''}
            onClick={() => setActiveTab('donation')}
          >
            Donaciones
          </button>

          {role === 'admin' && (
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Usuarios
            </button>
          )}
        </nav>
      </div>

      <div className="admin-right">
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
