import { useState, useEffect } from 'react';
import {
  BookOpen,
  CalendarDays,
  CircleDot,
  Disc3,
  HandHeart,
  Images,
  Info,
  LayoutTemplate,
  ListMusic,
  Megaphone,
  MessageSquare,
  Music,
  Newspaper,
  PanelBottom,
  Users
} from 'lucide-react';
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
import AgendaAdmin from './AgendaAdmin';
import StoriesAdmin from './StoriesAdmin';
import MusicAdmin from './MusicAdmin';
import ReleasesAdmin from './ReleasesAdmin';
import TopTracksAdmin from './TopTracksAdmin';
import BandMembersAdmin from './BandMembersAdmin';

import '../styles/admin.css';

const NAV_GROUPS = [
  {
    label: 'Comunidad',
    tabs: [
      { id: 'blog', label: 'Blog', icon: BookOpen, title: 'Bitácora', description: 'Publicaciones, entradas importadas desde redes y comentarios.', component: BlogAdmin },
      { id: 'stories', label: 'Historias', icon: CircleDot, title: 'Historias', description: 'Historias de Instagram capturadas para la franja de la portada.', component: StoriesAdmin },
      { id: 'chat', label: 'Mensajes', icon: MessageSquare, title: 'Mensajes', description: 'Lo que escriben los visitantes desde el chat del sitio.', component: ChatAdmin }
    ]
  },
  {
    label: 'Contenido',
    tabs: [
      { id: 'agenda', label: 'Agenda', icon: CalendarDays, title: 'Agenda', description: 'Próximas fechas y tocatas pasadas. Las detectadas en redes quedan por revisar.', component: AgendaAdmin },
      { id: 'sections', label: 'Secciones', icon: LayoutTemplate, title: 'Secciones', description: 'Textos principales de cada sección de la portada.', component: SectionAdmin },
      { id: 'about', label: 'Historia', icon: Info, title: 'Historia', description: 'El relato de la banda en la sección "Acerca de".', component: AboutAdmin },
      { id: 'news', label: 'Noticias', icon: Newspaper, title: 'Noticias', description: 'Novedades de la banda.', component: NewsAdmin },
      { id: 'extra-news', label: 'Barra de avisos', icon: Megaphone, title: 'Barra de avisos', description: 'Mensajes cortos que corren en la barra superior.', component: ExtraNewsAdmin },
      { id: 'photos', label: 'Galería', icon: Images, title: 'Galería', description: 'Fotos de la banda en el sitio.', component: PhotoAdmin }
    ]
  },
  {
    label: 'Música',
    tabs: [
      { id: 'music', label: 'Reproductor', icon: Music, title: 'Reproductor', description: 'La canción destacada y sus enlaces.', component: MusicAdmin },
      { id: 'releases', label: 'Discografía', icon: Disc3, title: 'Discografía', description: 'Singles y EPs publicados.', component: ReleasesAdmin },
      { id: 'tracks', label: 'Top tracks', icon: ListMusic, title: 'Top tracks', description: 'Canciones más escuchadas.', component: TopTracksAdmin },
      { id: 'members', label: 'Integrantes', icon: Users, title: 'Integrantes', description: 'Quiénes van arriba del tren.', component: BandMembersAdmin }
    ]
  },
  {
    label: 'Sitio',
    tabs: [
      { id: 'footer', label: 'Contacto y redes', icon: PanelBottom, title: 'Contacto y redes', description: 'Datos de contacto y enlaces del pie de página.', component: FooterAdmin },
      { id: 'donation', label: 'Donaciones', icon: HandHeart, title: 'Donaciones', description: 'Datos para apoyar a la banda.', component: DonationAdmin }
    ]
  }
];

const ALL_TABS = NAV_GROUPS.flatMap((g) => g.tabs.map((t) => ({ ...t, group: g.label })));
const STORAGE_KEY = 'admin-active-tab';

function readStoredTab() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return ALL_TABS.some((t) => t.id === saved) ? saved : 'blog';
  } catch {
    return 'blog';
  }
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(readStoredTab);
  const [menuOpen, setMenuOpen] = useState(false);

  const current = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];
  const Content = current.component;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, activeTab);
    } catch {
      // sin almacenamiento: no pasa nada
    }
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="admin-shell">
      <AdminHeader menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />

      <div className="flex">
        {/* Fondo oscuro del menú en móvil */}
        {menuOpen && (
          <div
            className="fixed inset-0 top-16 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside
          className={`subtle-scroll fixed top-16 bottom-0 left-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-border/60 bg-background transition-transform duration-300 lg:sticky lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="py-8 px-4 space-y-8">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="px-3 mb-3 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground/70">
                  {group.label}
                </div>
                <ul className="space-y-0.5">
                  {group.tabs.map(({ id, label, icon: Icon }) => {
                    const active = id === activeTab;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => handleTabChange(id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm border-l-2 transition ${
                            active
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          <Icon size={16} strokeWidth={1.6} className={active ? 'text-primary' : ''} />
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-14">
            <header className="mb-10">
              <div className="text-eyebrow mb-3">{current.group}</div>
              <h1 className="text-display text-4xl md:text-5xl">{current.title}</h1>
              <p className="mt-3 text-muted-foreground">{current.description}</p>
            </header>
            <Content key={current.id} />
          </div>
        </main>
      </div>
    </div>
  );
}
