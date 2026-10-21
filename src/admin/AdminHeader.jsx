import { useEffect, useState } from 'react';
import { ArrowUpRight, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import logoMark from '../assets/logo-mark.png';
import logoText from '../assets/logo-text.png';

export default function AdminHeader({ menuOpen, onToggleMenu }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/#/login';
  };

  const userName = profile?.name || user?.email?.split('@')[0] || 'Admin';
  const userRole = profile?.role === 'admin' ? 'Administrador' : 'Editor';

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMenu}
            className="lg:hidden -ml-1 p-2 text-muted-foreground hover:text-foreground"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <a href="#/" className="flex items-center gap-2 shrink-0" title="Ir al sitio">
            <img src={logoMark} alt="" className="w-10 h-10 invert opacity-90" />
            <img
              src={logoText}
              alt="Tren de Medianoche"
              className="hidden sm:block h-6 w-auto invert opacity-90"
            />
          </a>
          <span className="hidden md:block h-6 w-px bg-border mx-2" />
          <span className="hidden md:block text-eyebrow">Panel de administración</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="#/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition"
          >
            Ver sitio <ArrowUpRight size={14} />
          </a>
          <div className="hidden md:flex flex-col items-end leading-tight pl-4 border-l border-border/60">
            <span className="text-sm text-foreground">{userName}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              {userRole}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-accent hover:text-foreground transition"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
