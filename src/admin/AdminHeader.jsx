import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import '../styles/AdminHeader-Modern.css';

export default function AdminHeader({ activeTab, setActiveTab, role }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();
    
    if (data) setProfile(data);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/#/login';
  };

  const userName = profile?.name || user?.email?.split('@')[0] || 'Admin';
  const userRole = profile?.role === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <header className="admin-header-modern">
      <div className="admin-header-left">
        <div className="admin-logo-combo">
          <div className="admin-logo-icon"></div>
          <div className="admin-logo-text"></div>
        </div>
        <div className="admin-title-section">
          <h1 className="admin-title">Panel de Control</h1>
          <p className="admin-subtitle">Gestión de Contenido</p>
        </div>
      </div>

      <div className="admin-header-right">
        <div className="admin-user-info">
          <span className="user-icon">👤</span>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </div>
    </header>
  );
}
