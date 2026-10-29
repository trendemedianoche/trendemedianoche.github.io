import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import logoText from '../assets/logo-text.png';
import NewsTicker from './NewsTicker.jsx';
import StoriesButton from './StoriesButton.jsx';

const SPOTIFY_URL = 'https://open.spotify.com/artist/2ZRyGZfKgNjNKbry4Aqv7J';

const NAV_LINKS = [
  ['top', 'Inicio'],
  ['historia', 'Historia'],
  ['musica', 'Música'],
  ['banda', 'Banda'],
  ['fechas', 'Fechas'],
  ['blog', 'Blog'],
  ['contacto', 'Contacto']
];

// visible: secciones mostradas en la portada (las ocultas en el admin salen del menú)
export default function SiteNav({ ticker = [], visible }) {
  const links = visible
    ? NAV_LINKS.filter(([id]) => id === 'top' || visible.includes(id))
    : NAV_LINKS;
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('top');
  const [scrolled, setScrolled] = useState(false);

  // Sección visible → enlace activo; y menú más compacto al bajar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    // Las secciones pueden montarse después (lazy / datos), se reintenta un momento
    const t = setTimeout(() => {
      NAV_LINKS.forEach(([id]) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 300);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
      io.disconnect();
    };
  }, []);

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
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between border bg-background/85 backdrop-blur-md transition-all duration-500 ${
          scrolled
            ? 'mt-3 max-w-6xl h-16 rounded-full border-border/70 px-3 pl-4 shadow-deep mx-3 xl:mx-auto'
            : 'mt-0 max-w-full h-20 rounded-none border-transparent border-b-border/40 px-6 md:px-10'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3">
          {/* Con historias por ver, el logo lleva un anillo y abre las historias */}
          <StoriesButton
            fallback={
              <a href="#/" onClick={(e) => goToSection(e, 'top')}>
                <img
                  src={logoMark}
                  alt="Tren de Medianoche"
                  className="w-11 h-11 md:w-12 md:h-12 invert opacity-90"
                />
              </a>
            }
          >
            <img
              src={logoMark}
              alt="Tren de Medianoche"
              className="w-9 h-9 md:w-10 md:h-10 invert opacity-90"
            />
          </StoriesButton>
          <a href="#/" onClick={(e) => goToSection(e, 'top')}>
            <img
              src={logoText}
              alt="Tren de Medianoche"
              className="h-6 md:h-8 w-auto invert opacity-90"
            />
          </a>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.22em]">
          {links.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => goToSection(e, id)}
              aria-current={active === id ? 'true' : undefined}
              className={`px-3.5 py-2 rounded-full transition-colors ${
                active === id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href={SPOTIFY_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-shine hidden lg:inline-flex items-center gap-1.5 text-eyebrow text-primary-foreground px-4 py-2.5 rounded-full bg-ember-gradient shadow-ember"
        >
          Spotify <ArrowUpRight size={13} />
        </a>

        {/* Hamburguesa (móvil) */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          className="lg:hidden text-foreground w-11 h-11 flex items-center justify-center rounded-full hover:bg-primary/10 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Barra de avisos fija bajo el menú (solo escritorio, antes de bajar) */}
      {ticker.length > 0 && !scrolled && (
        <NewsTicker
          items={ticker}
          className="pointer-events-auto hidden lg:block py-2 bg-background/60"
        />
      )}

      {/* Menú móvil */}
      {menuOpen && (
        <div className="pointer-events-auto lg:hidden mx-3 mt-2 rounded-2xl border border-border/70 bg-background/95 backdrop-blur-md p-3 shadow-deep">
          {links.map(([id, label], i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => goToSection(e, id)}
              className={`flex items-baseline gap-4 px-4 py-3 rounded-xl transition-colors ${
                active === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-primary/5'
              }`}
            >
              <span className="font-mono text-[0.65rem] text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-display text-2xl">{label}</span>
            </a>
          ))}
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-ember-gradient text-primary-foreground text-eyebrow"
          >
            Escuchar en Spotify <ArrowUpRight size={14} />
          </a>
        </div>
      )}
    </header>
  );
}
