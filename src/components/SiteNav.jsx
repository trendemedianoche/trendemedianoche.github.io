import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import logoText from '../assets/logo-text.png';

const SPOTIFY_URL = 'https://open.spotify.com/artist/2ZRyGZfKgNjNKbry4Aqv7J';

const NAV_LINKS = [
  ['lanzamiento', 'Nuevo'],
  ['historia', 'Historia'],
  ['musica', 'Música'],
  ['banda', 'Banda'],
  ['fechas', 'Fechas'],
  ['blog', 'Blog'],
  ['contacto', 'Contacto']
];

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const goToSection = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    const hash = window.location.hash;
    const onHome = !hash || hash === '#/' || hash === '#';
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Desde el blog u otra ruta: ir al inicio y luego desplazar
      sessionStorage.setItem('scrollTarget', id);
      window.location.hash = '#/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <a
          href="#/"
          onClick={(e) => goToSection(e, 'top')}
          className="flex items-center gap-2 md:gap-3"
        >
          <img
            src={logoMark}
            alt="Tren de Medianoche"
            className="w-12 h-12 md:w-14 md:h-14 invert opacity-90"
          />
          <img
            src={logoText}
            alt="Tren de Medianoche"
            className="h-7 md:h-9 w-auto invert opacity-90"
          />
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => goToSection(e, id)}
              className="hover:text-primary transition"
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href={SPOTIFY_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden lg:inline-block text-eyebrow px-3 py-2 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition"
        >
          Spotify
        </a>

        {/* Hamburguesa (móvil) */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="lg:hidden text-foreground p-2 -mr-2"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-md px-6 py-6 flex flex-col gap-4">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => goToSection(e, id)}
              className="text-eyebrow text-muted-foreground hover:text-primary transition"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
