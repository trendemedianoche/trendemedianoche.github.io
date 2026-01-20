import { supabase } from '../lib/supabase';
import '../styles/AdminHeader-Modern.css';

export default function AdminHeader({ activeTab, setActiveTab, role }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/#/login';
  };

  return (
    <header className="admin-header-modern">
      <div className="admin-header-left">
        <h1 className="admin-title">🎵 Admin · Tren de Medianoche</h1>
        <p className="admin-subtitle">Panel de Control</p>
      </div>

      <div className="admin-header-right">
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
