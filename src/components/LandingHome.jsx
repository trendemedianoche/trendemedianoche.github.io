import { Fragment, useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  Instagram,
  Facebook,
  Youtube,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  ArrowUpRight,
  Play,
  Pause
} from 'lucide-react';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import NewsTicker from './NewsTicker.jsx';

import { getGalleryImages } from '../services/galleryService';
import { getAbout } from '../services/aboutService';
import { getLatestSong } from '../services/musicService';
import { getExtraNewsItems } from '../services/extraNewsService';
import { getBlogPosts } from '../services/blogService';
import { sendChatMessage } from '../services/chatService';
import { getNews } from '../services/newsService';
import { getPublishedEvents } from '../services/eventsService';
import { getTransferData } from '../services/donationService';
import { getReleases } from '../services/releasesService';
import { getTopTracks } from '../services/topTracksService';
import { getBandMembers } from '../services/bandMembersService';
import { getSiteSections } from '../services/siteSectionsService';
import { resolveSections } from '../lib/landingSections';
import {
  getFooterContactData,
  getFooterSocialNetworks
} from '../services/donationService';

// Imágenes locales de respaldo (si Supabase aún no tiene contenido)
import guitarImg from '../assets/guitar.jpeg';
import harmonicaImg from '../assets/harmonica.jpeg';
import trainNight from '../assets/train-night.jpeg';
import bandBar1 from '../assets/band-bar-1.png';
import bandBar2 from '../assets/band-bar-2.png';
import bandTracks from '../assets/band-tracks.png';
import logoMark from '../assets/logo-mark.png';
import sientesComoMp3 from '../assets/sientes_como.mp3';

/* ------------------------------ DATOS FIJOS ------------------------------ */
/* Enlaces y contenido sin backend (discografía, integrantes, fechas).       */

const SPOTIFY_URL = 'https://open.spotify.com/artist/2ZRyGZfKgNjNKbry4Aqv7J';
const SPOTIFY_ARTIST_EMBED =
  'https://open.spotify.com/embed/artist/2ZRyGZfKgNjNKbry4Aqv7J?utm_source=generator&theme=0';
// Track "Sientes Cómo" — embed con botón de play y carátula
const SPOTIFY_TRACK_EMBED =
  'https://open.spotify.com/embed/track/4GZ6PL2ci4VAUgGAlQ4qoo?utm_source=generator&theme=0';
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=P55OqqhOlTE';

const LATEST_FALLBACK = {
  title: 'Sientes Cómo',
  year: '2024',
  note: 'Nuestro último lanzamiento. Un blues eléctrico que camina lento y pega hondo.'
};

const band = [
  {
    name: 'Manuel Mercado',
    role: 'Guitarra & Voz',
    note: 'Compositor principal'
  },
  {
    name: 'Ricardo Mizraji',
    role: 'Armónica, Teclado & Coros',
    note: 'Hohner Marine Band'
  },
  {
    name: 'José Antil',
    role: 'Guitarra, Armónica & Coros',
    note: 'Slide & rítmica'
  }
];

const releases = [
  {
    year: '2024',
    title: 'Sientes Cómo',
    type: 'Single',
    note: 'Último lanzamiento'
  },
  {
    year: '2023',
    title: 'Cuatro Patitas',
    type: 'Single',
    note: 'Historia de adopción'
  },
  {
    year: '2023',
    title: 'Carta a mis amigos',
    type: 'Single',
    note: 'En memoria de H. Briceño'
  },
  {
    year: '2023',
    title: 'Aullando a la Luna',
    type: 'Single',
    note: 'Con César Díaz Bilbao en batería'
  },
  {
    year: '2022',
    title: 'Mi padrino es un bohemio',
    type: 'Single',
    note: 'Primer adelanto del álbum debut'
  },
  {
    year: '2021',
    title: 'Desde la Otra Ruta',
    type: 'EP',
    note: 'Producido por Johnny Espina'
  },
  {
    year: '2021',
    title: 'Mi Mejor Regalo',
    type: 'Single',
    note: 'Con Nehemías Muñoz en saxofón'
  },
  {
    year: '2018',
    title: 'Arriba de la Locomotora',
    type: 'EP',
    note: 'Producido por Cristian Olivares'
  },
  {
    year: '2018',
    title: 'Santa se Llevó a Mi Chica',
    type: 'Single',
    note: 'Single navideño'
  }
];

const topTracks = [
  { n: '01', title: 'Perro Callejero', time: '03:28' },
  { n: '02', title: 'Cuatro Patitas', time: '03:28' },
  { n: '03', title: 'Estación Central', time: '05:05' },
  { n: '04', title: 'Santa Se Llevó a Mi Chica', time: '04:34' },
  { n: '05', title: 'Mi Padrino Es un Bohemio', time: '04:20' },
  { n: '06', title: 'Solo Debes Sonreír', time: '03:28' },
  { n: '07', title: 'Única y Diferente', time: '04:51' },
  { n: '08', title: 'Sr. Alcalde', time: '04:45' },
  { n: '09', title: 'Mientras Mi Corazón', time: '04:07' },
  { n: '10', title: 'Sientes Cómo', time: '04:31' }
];

const FALLBACK_SLIDES = [
  {
    src: bandBar1,
    alt: 'Tren de Medianoche en la barra',
    caption: 'En la barra · Santiago'
  },
  {
    src: bandBar2,
    alt: 'Tren de Medianoche sentados en el bar',
    caption: 'Antes del show'
  },
  {
    src: bandTracks,
    alt: 'Tren de Medianoche sobre las vías',
    caption: 'En las vías · Cordillera'
  }
];

const FALLBACK_TICKER = [
  { icon: '★', content: 'Nuevo single "Sientes Cómo" disponible' },
  { icon: '★', content: '8 años en las vías del blues' },
  { icon: '★', content: 'Nuevo material en camino' },
  { icon: '★', content: 'Escúchanos en Spotify' }
];

const ABOUT_FALLBACK = `
  <p>Tren de Medianoche surge en 2017 como un proyecto musical enfocado en la
  composición original y la improvisación, con una propuesta sonora basada
  principalmente en instrumentos electroacústicos.</p>
  <p>En agosto de 2017 debutamos en vivo participando en un festival por el Día
  Internacional del Blues. Desde entonces, hemos recorrido escenarios, festivales,
  eventos culturales y bares, consolidándonos como una banda emergente dentro del
  blues nacional.</p>
`;

const SOCIAL_ICONS = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  Youtube,
  WhatsApp: MessageCircle
};

function stripHtml(html = '') {
  // DOMParser también decodifica entidades como &quot;
  return (
    new DOMParser().parseFromString(html, 'text/html').body.textContent || ''
  )
    .replace(/\s+/g, ' ')
    .trim();
}

// Resumen sin repetir el título al comienzo
function postExcerpt(post) {
  const text = stripHtml(post.content);
  return !post.title.endsWith('…') && text.startsWith(post.title)
    ? text.slice(post.title.length).trim()
    : text;
}

const DEFAULT_TRACK_ID = '4GZ6PL2ci4VAUgGAlQ4qoo'; // Sientes Cómo

function extractSpotifyId(url) {
  if (!url) return null;
  const m = String(url).match(/track\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

// 'YYYY-MM-DD' como fecha local (new Date('2026-11-07') la tomaría en UTC y mostraría el día anterior)
function parseEventDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return value;
  }
}

/* ------------------------------ COMPONENTES ------------------------------ */

function SocialRow({ links, variant = 'ghost' }) {
  const base =
    variant === 'solid'
      ? 'w-11 h-11 flex items-center justify-center border border-border/60 hover:border-primary hover:bg-primary hover:text-primary-foreground text-foreground transition'
      : 'w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition';

  if (!links?.length) return null;

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => {
        const Icon = SOCIAL_ICONS[l.name] || ArrowUpRight;
        return (
          <a
            key={l.name + l.url}
            href={l.url}
            target={l.url.startsWith('mailto:') ? undefined : '_blank'}
            rel="noreferrer"
            aria-label={l.name}
            className={base}
          >
            <Icon size={17} />
          </a>
        );
      })}
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // null | 'sending' | 'ok' | 'error'

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 150);
    const cleanMessage = message.trim().slice(0, 2000);
    if (!cleanMessage) return;

    setStatus('sending');
    try {
      await sendChatMessage({
        name: cleanName || 'Anónimo',
        email: cleanEmail,
        message: cleanMessage
      });
      setStatus('ok');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="text-center py-10">
        <div className="text-eyebrow mb-3">Mensaje enviado</div>
        <p className="text-muted-foreground">
          Gracias por escribirnos. Te responderemos pronto. ✨
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 text-left">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-eyebrow block mb-2">Nombre</span>
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border border-border/70 focus:border-primary outline-none px-4 py-3 font-mono text-sm transition"
            placeholder="Tu nombre"
          />
        </label>
        <label className="block">
          <span className="text-eyebrow block mb-2">Email</span>
          <input
            type="email"
            maxLength={150}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-border/70 focus:border-primary outline-none px-4 py-3 font-mono text-sm transition"
            placeholder="tucorreo@ejemplo.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-eyebrow block mb-2">Mensaje</span>
        <textarea
          required
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full bg-transparent border border-border/70 focus:border-primary outline-none px-4 py-3 font-mono text-sm transition resize-none"
          placeholder="Cuéntanos brevemente qué necesitas…"
        />
      </label>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground">
          {status === 'error'
            ? 'No se pudo enviar. Intenta de nuevo.'
            : 'Tu mensaje llega directo a la banda.'}
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-shine w-full sm:w-auto px-8 py-4 whitespace-nowrap shrink-0 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform disabled:opacity-60"
        >
          {status === 'sending' ? 'Enviando…' : 'Enviar mensaje →'}
        </button>
      </div>
    </form>
  );
}

// Número de sección gigante, solo contorno, de fondo
function SectionNum({ n }) {
  if (!n) return null;
  return (
    <span aria-hidden="true" className="section-num">
      {n}
    </span>
  );
}

// Título editable: *texto* va en cursiva ámbar y cada salto de línea parte el título
function RichTitle({ text = '' }) {
  return text.split('\n').map((line, li, lines) => (
    <Fragment key={li}>
      {line.split(/\*([^*]+)\*/).map((part, pi) =>
        pi % 2 === 1 ? (
          <span key={pi} className="italic text-primary">
            {part}
          </span>
        ) : (
          part
        )
      )}
      {li < lines.length - 1 && <br />}
    </Fragment>
  ));
}

// Etiqueta de sección con su número (si la sección va numerada)
function Eyebrow({ n, children, className = 'mb-4' }) {
  return (
    <div className={`text-eyebrow ${className}`}>
      {n && (
        <>
          <span className="text-muted-foreground">{n}</span>{' '}
          <span className="inline-block h-px w-8 bg-primary/60 align-middle mx-2" />{' '}
        </>
      )}
      {children}
    </div>
  );
}

/* ------------------------------ PÁGINA ------------------------------ */

export default function LandingHome() {
  const [slide, setSlide] = useState(0);
  const [events, setEvents] = useState({ upcoming: [], past: [] });

  // Al volver del blog u otra ruta con un destino de sección, desplazar
  useEffect(() => {
    const target = sessionStorage.getItem('scrollTarget');
    if (target) {
      sessionStorage.removeItem('scrollTarget');
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  // Aparición al hacer scroll: observa los .reveal, incluidos los que llegan
  // después con los datos de Supabase (MutationObserver)
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    const observeAll = () =>
      root
        .querySelectorAll('.reveal:not(.is-visible)')
        .forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Foco de luz de las tarjetas .spotlight: sigue al cursor
  const handleSpotlight = (e) => {
    const card = e.target.closest?.('.spotlight');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  // Reproductor de Spotify embebido (IFrame API) para el Top 10
  const spotifyEmbedRef = useRef(null);
  const spotifyControllerRef = useRef(null);
  const [playing, setPlaying] = useState({ key: null, paused: false });

  useEffect(() => {
    const setup = (IFrameAPI) => {
      if (!spotifyEmbedRef.current || spotifyControllerRef.current) return;
      IFrameAPI.createController(
        spotifyEmbedRef.current,
        { width: '100%', height: 80, uri: `spotify:track:${DEFAULT_TRACK_ID}` },
        (controller) => {
          spotifyControllerRef.current = controller;
        }
      );
    };

    if (window.__spotifyIframeAPI) {
      setup(window.__spotifyIframeAPI);
    } else {
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.__spotifyIframeAPI = IFrameAPI;
        setup(IFrameAPI);
      };
      if (!document.getElementById('spotify-iframe-api')) {
        const s = document.createElement('script');
        s.id = 'spotify-iframe-api';
        s.src = 'https://open.spotify.com/embed/iframe-api/v1';
        document.body.appendChild(s);
      }
    }
  }, []);

  const playTrack = (track) => {
    const controller = spotifyControllerRef.current;
    if (!controller) return;
    const key = track.id ?? track.title;

    // Mismo track: alternar play/pausa
    if (playing.key === key) {
      controller.togglePlay();
      setPlaying((p) => ({ key, paused: !p.paused }));
      return;
    }

    // Track distinto: cargar y reproducir
    const id = extractSpotifyId(track.spotify_url);
    if (id) controller.loadUri(`spotify:track:${id}`);
    controller.play();
    setPlaying({ key, paused: false });
  };

  // Arrastrar con el mouse la línea de tiempo (click + drag)
  const timelineRef = useRef(null);
  const dragRef = useRef({ down: false, startX: 0, scrollLeft: 0 });

  const onDragStart = (e) => {
    const el = timelineRef.current;
    if (!el) return;
    dragRef.current = {
      down: true,
      startX: e.pageX,
      scrollLeft: el.scrollLeft
    };
  };
  const onDragMove = (e) => {
    const el = timelineRef.current;
    if (!el || !dragRef.current.down) return;
    e.preventDefault();
    el.scrollLeft =
      dragRef.current.scrollLeft - (e.pageX - dragRef.current.startX);
  };
  const onDragEnd = () => {
    dragRef.current.down = false;
  };

  // Datos dinámicos desde Supabase
  const [gallery, setGallery] = useState([]);
  const [aboutHtml, setAboutHtml] = useState('');
  const [song, setSong] = useState(null);
  const [extraNews, setExtraNews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [contact, setContact] = useState({ email: null, phone: null });
  const [socials, setSocials] = useState([]);
  const [releasesData, setReleasesData] = useState([]);
  const [tracksData, setTracksData] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [donationFields, setDonationFields] = useState([]);
  const [sectionRows, setSectionRows] = useState([]);

  useEffect(() => {
    getGalleryImages()
      .then(setGallery)
      .catch(() => {});
    getNews()
      .then(setNewsItems)
      .catch(() => {});
    getPublishedEvents()
      .then(setEvents)
      .catch(() => {});
    getTransferData()
      .then(setDonationFields)
      .catch(() => {});
    getAbout()
      .then(setAboutHtml)
      .catch(() => {});
    getLatestSong()
      .then(setSong)
      .catch(() => {});
    getExtraNewsItems()
      .then((items) => setExtraNews(items.filter((i) => i.active !== false)))
      .catch(() => {});
    getBlogPosts()
      .then(setPosts)
      .catch(() => {});
    getFooterContactData()
      .then(setContact)
      .catch(() => {});
    getFooterSocialNetworks()
      .then(setSocials)
      .catch(() => {});
    getReleases()
      .then(setReleasesData)
      .catch(() => {});
    getTopTracks()
      .then(setTracksData)
      .catch(() => {});
    getBandMembers()
      .then(setMembersData)
      .catch(() => {});
    getSiteSections()
      .then(setSectionRows)
      .catch(() => {});
  }, []);

  // Orden, visibilidad y textos de las secciones (admin → Secciones)
  const { order: sectionOrder, text: T } = resolveSections(sectionRows);
  // Numeración 01, 02… según el orden visible
  const num = {};
  sectionOrder
    .filter((k) => T[k].numbered)
    .forEach((k, i) => {
      num[k] = String(i + 1).padStart(2, '0');
    });

  // Datos con respaldo local si la tabla viene vacía
  const releaseList = releasesData.length > 0 ? releasesData : releases;
  const trackList = tracksData.length > 0 ? tracksData : topTracks;
  const memberList = membersData.length > 0 ? membersData : band;

  // Slides del hero: galería real o respaldo local
  const slides =
    gallery.length > 0
      ? gallery.map((g) => ({
          src: g.url,
          alt: g.alt || 'Tren de Medianoche',
          caption: g.caption || g.alt || 'Tren de Medianoche'
        }))
      : FALLBACK_SLIDES;

  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % slides.length),
      7000
    );
    return () => clearInterval(id);
  }, [slides.length]);

  // El sitio usa HashRouter: interceptamos los clics de ancla (#seccion)
  // para hacer scroll suave sin que el router los trate como rutas.
  const handleAnchorClick = (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Enlaces sociales (footer / contacto) desde social_networks
  const socialLinks = [
    ...socials.map((s) => ({ name: s.name, url: s.url })),
    contact.phone
      ? { name: 'WhatsApp', url: `https://wa.me/${contact.phone}` }
      : null,
    contact.email ? { name: 'Email', url: `mailto:${contact.email}` } : null
  ].filter(Boolean);

  // Ticker del hero desde extra_news_items (o respaldo)
  const ticker = extraNews.length > 0 ? extraNews : FALLBACK_TICKER;

  // Novedades: próximas fechas confirmadas primero, luego noticias de los últimos 6 meses
  const sixMonthsAgo = new Date(Date.now() - 183 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const novedades = [
    ...events.upcoming.slice(0, 2).map((e) => ({
      key: `event-${e.id}`,
      event: e,
      eyebrow: 'Nueva fecha',
      title: e.title,
      content: [
        e.venue !== e.title ? e.venue : '',
        e.city,
        e.event_time && `${e.event_time} h`
      ]
        .filter(Boolean)
        .join(' · ')
    })),
    ...newsItems
      .filter((n) => !n.date || n.date >= sixMonthsAgo)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .map((n) => ({
        key: `news-${n.id}`,
        eyebrow: n.date ? formatDate(n.date) : 'Novedad',
        title: n.title,
        content: n.content
      }))
  ].slice(0, 4);

  // Último lanzamiento (canción real o respaldo)
  const latestTitle = song?.title || LATEST_FALLBACK.title;
  const latestSubtitle = song
    ? [song.album, song.artist].filter(Boolean).join(' · ')
    : LATEST_FALLBACK.note;
  const songSpotify = song?.spotify_url || SPOTIFY_URL;
  const songYoutube = song?.youtube_url || YOUTUBE_URL;
  const songAudio = song?.audioUrl || sientesComoMp3;
  const songCover = song?.coverUrl || null;

  const visibleDonation = donationFields.filter((f) => f.visible !== false);
  const copyDonation = () => {
    const text = visibleDonation
      .map((f) => `${f.field_key}: ${f.field_value}`)
      .join('\n');
    navigator.clipboard?.writeText(text);
  };

  const emailAddr = contact.email || 'bandatrendemedianoche@gmail.com';
  const whatsappUrl = contact.phone
    ? `https://wa.me/${contact.phone}`
    : 'https://api.whatsapp.com/send/?phone=56963223241';

  // Secciones de la portada como bloques: el admin (Secciones) define orden y visibilidad
  const blocks = {
    lanzamiento: (
      <section
        id="lanzamiento"
        className="relative py-16 md:py-24 border-t border-border/40 bg-smoke-gradient"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10 items-center">
          <div className="reveal lg:col-span-5">
            <div className="text-eyebrow mb-4 animate-flicker">
              {T.lanzamiento.eyebrow}
            </div>
            <h2 className="text-display text-6xl md:text-8xl leading-[0.9] mb-6">
              {latestTitle.split(' ')[0]}
              <br />
              <span className="italic text-primary">
                {latestTitle.split(' ').slice(1).join(' ')}.
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-8">
              {latestSubtitle || LATEST_FALLBACK.note}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={songSpotify}
                target="_blank"
                rel="noreferrer"
                className="btn-shine px-6 py-3 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform inline-flex items-center gap-2"
              >
                Escuchar en Spotify <ArrowUpRight size={14} />
              </a>
              <a
                href={songYoutube}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 border border-foreground/30 text-foreground text-eyebrow hover:border-primary hover:text-primary transition inline-flex items-center gap-2"
              >
                Ver en YouTube <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
          <div className="reveal lg:col-span-7" style={{ '--d': '150ms' }}>
            <div className="spotlight relative shadow-deep rounded-md border border-border/60 bg-card/40 p-5 md:p-6">
              <div className="absolute -inset-3 bg-ember-gradient opacity-20 blur-2xl -z-10" />
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                {songCover && (
                  <img
                    src={songCover}
                    alt={latestTitle}
                    className="w-36 h-36 md:w-40 md:h-40 object-cover shrink-0"
                  />
                )}
                <div className="flex-1 w-full min-w-0">
                  <div className="text-eyebrow mb-2">Reproduce el single</div>
                  <h3 className="text-display text-3xl md:text-4xl mb-1 truncate">
                    {latestTitle}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mb-4">
                    {latestSubtitle}
                  </p>
                  <audio
                    controls
                    preload="metadata"
                    src={songAudio}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    historia: (
      <section
        id="historia"
        className="relative py-20 md:py-28 border-t border-border/40"
      >
        <SectionNum n={num.historia} />
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="reveal md:col-span-5 group relative overflow-hidden shadow-deep">
            <img
              src={slides[1]?.src || trainNight}
              alt="Tren de Medianoche"
              loading="lazy"
              className="photo-warm w-full aspect-square object-cover object-top"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/20" />
          </div>
          <div className="reveal md:col-span-7" style={{ '--d': '150ms' }}>
            <Eyebrow n={num.historia} className="mb-6">
              {T.historia.eyebrow}
            </Eyebrow>
            <h2 className="text-display text-5xl md:text-7xl leading-[0.95] mb-8">
              <RichTitle text={T.historia.title} />
            </h2>
            <div
              className="space-y-5 text-muted-foreground leading-relaxed [&_p]:mb-4 [&_a]:text-primary"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(aboutHtml || ABOUT_FALLBACK)
              }}
            />

            <div className="mt-10 grid grid-cols-3 gap-4">
              {(T.historia.extra.stats || []).map((s) => (
                <div key={s.l} className="border-t border-primary/40 pt-4">
                  <div className="text-display text-4xl md:text-5xl text-primary">
                    {s.n}
                  </div>
                  <div className="text-eyebrow mt-2">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),

    musica: (
      <section
        id="musica"
        className="relative py-20 md:py-28 bg-smoke-gradient border-t border-border/40"
      >
        <SectionNum n={num.musica} />
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="reveal flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow n={num.musica} className="mb-4">
                {T.musica.eyebrow}
              </Eyebrow>
              <h2 className="text-display text-5xl md:text-7xl">
                <RichTitle text={T.musica.title} />
              </h2>
            </div>
            <a
              href={SPOTIFY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-eyebrow text-primary hover:underline"
            >
              Ver perfil completo →
            </a>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="reveal lg:col-span-2 min-h-[420px] group overflow-hidden shadow-deep">
              <img
                src={slides[1]?.src || slides[0]?.src || guitarImg}
                alt="Tren de Medianoche"
                loading="lazy"
                className="photo-warm w-full h-full object-cover object-top"
              />
            </div>

            <div className="reveal lg:col-span-3" style={{ '--d': '150ms' }}>
              <div className="text-eyebrow mb-4">Canciones · escúchalas</div>
              <ol className="divide-y divide-border/60 border-y border-border/60">
                {trackList.map((t, i) => {
                  const num = String(t.position ?? t.n ?? i + 1).padStart(
                    2,
                    '0'
                  );
                  const time = t.duration ?? t.time;
                  const key = t.id ?? t.title;
                  const isPlaying = playing.key === key && !playing.paused;
                  return (
                    <li
                      key={t.id ?? t.title}
                      className="flex items-center gap-3 py-4 px-2 group hover:bg-primary/5 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => playTrack(t)}
                        aria-label={`${isPlaying ? 'Pausar' : 'Reproducir'} ${t.title}`}
                        className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full border transition ${
                          isPlaying
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border/60 text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {isPlaying ? (
                          <Pause size={14} fill="currentColor" />
                        ) : (
                          <Play size={14} fill="currentColor" />
                        )}
                      </button>
                      <span className="shrink-0 w-6 font-mono text-xs text-primary">
                        {isPlaying ? (
                          <span className="eq" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                          </span>
                        ) : (
                          num
                        )}
                      </span>
                      <span
                        className={`flex-1 min-w-0 text-display text-xl md:text-2xl truncate transition-colors group-hover:text-primary ${
                          isPlaying ? 'text-primary italic' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {time}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Reproductor Spotify OCULTO pero DENTRO del viewport (Spotify pausa
              si el iframe queda fuera de pantalla; con opacity 0 sigue sonando) */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              right: 0,
              bottom: 0,
              width: '320px',
              height: '80px',
              opacity: 0,
              pointerEvents: 'none',
              zIndex: -1
            }}
          >
            <div ref={spotifyEmbedRef} />
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between gap-4 mb-10">
              <div className="text-eyebrow">Línea de tiempo</div>
              <div className="text-eyebrow text-muted-foreground hidden md:block">
                desliza →
              </div>
            </div>

            {/* Móvil: línea de tiempo VERTICAL */}
            <div className="md:hidden relative border-l border-border/60 ml-1.5">
              {releaseList.map((r) => (
                <div
                  key={r.id ?? r.title}
                  className="relative pl-6 pb-8 last:pb-0"
                >
                  <span className="absolute left-0 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-ember" />
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-mono text-sm text-primary">
                      {r.year}
                    </span>
                    <span className="text-eyebrow">{r.type}</span>
                  </div>
                  <h3 className="text-display text-2xl mt-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{r.note}</p>
                </div>
              ))}
            </div>

            {/* Desktop: línea de tiempo HORIZONTAL (arrastrable) */}
            <div className="relative hidden md:block">
              <div
                ref={timelineRef}
                onMouseDown={onDragStart}
                onMouseMove={onDragMove}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                className="timeline-scroll overflow-x-auto pt-4 pb-8 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="relative flex gap-6 min-w-max pr-10">
                  {/* Línea horizontal continua */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-border/60" />
                  {releaseList.map((r) => (
                    <div
                      key={r.id ?? r.title}
                      className="relative w-60 shrink-0 pt-8 group"
                    >
                      <span className="absolute top-0 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-ember" />
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="font-mono text-sm text-primary">
                          {r.year}
                        </span>
                        <span className="text-eyebrow">{r.type}</span>
                      </div>
                      <h3 className="text-display text-2xl mt-1 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
            </div>
          </div>
        </div>
      </section>
    ),

    banda: (
      <section
        id="banda"
        className="relative py-20 md:py-28 border-t border-border/40"
      >
        <SectionNum n={num.banda} />
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12">
          <div className="reveal md:col-span-5">
            <Eyebrow n={num.banda} className="mb-4">
              {T.banda.eyebrow}
            </Eyebrow>
            <h2 className="text-display text-5xl md:text-6xl mb-8">
              <RichTitle text={T.banda.title} />
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="group overflow-hidden shadow-deep">
                <img
                  src={slides[0]?.src || guitarImg}
                  alt="Tren de Medianoche"
                  loading="lazy"
                  className="photo-warm w-full aspect-square object-cover object-top"
                />
              </div>
              <div className="group overflow-hidden shadow-deep translate-y-8">
                <img
                  src={slides[2]?.src || harmonicaImg}
                  alt="Tren de Medianoche"
                  loading="lazy"
                  className="photo-warm w-full aspect-square object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-2 self-center">
            {memberList.map((m, i) => (
              <div
                key={m.id ?? m.name}
                className="reveal spotlight group overflow-hidden border border-border/60 p-6 md:p-8 hover:border-primary/40 transition-colors"
                style={{ '--d': `${i * 120}ms` }}
              >
                {/* Iniciales grandes de fondo */}
                <span
                  aria-hidden="true"
                  className="text-outline absolute -right-2 -bottom-6 text-display text-[7rem] md:text-[8.5rem] leading-none select-none pointer-events-none transition-transform duration-700 group-hover:-translate-x-3"
                >
                  {m.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div className="relative flex items-baseline justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-display text-3xl md:text-4xl group-hover:italic group-hover:text-primary transition-colors">
                      {m.name}
                    </h3>
                  </div>
                  <span className="text-eyebrow">{m.role}</span>
                </div>
                {m.note && (
                  <p className="relative font-mono text-xs text-muted-foreground mt-3 pl-8">
                    {m.note}
                  </p>
                )}
              </div>
            ))}

            {T.banda.intro && (
              <p className="text-muted-foreground text-sm leading-relaxed mt-8 border-l-2 border-primary/40 pl-6">
                <RichTitle text={T.banda.intro} />
              </p>
            )}
          </div>
        </div>
      </section>
    ),

    fechas: (
      <section
        id="fechas"
        className="relative py-20 md:py-28 bg-smoke-gradient border-t border-border/40"
      >
        <SectionNum n={num.fechas} />
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="reveal flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow n={num.fechas} className="mb-4">
                {T.fechas.eyebrow}
              </Eyebrow>
              <h2 className="text-display text-5xl md:text-7xl">
                <RichTitle text={T.fechas.title} />
              </h2>
            </div>
          </div>

          {events.upcoming.length === 0 ? (
            <div className="reveal spotlight border border-dashed border-border/60 p-12 md:p-16 text-center">
              <Calendar
                className="mx-auto mb-6 text-primary"
                size={40}
                strokeWidth={1.2}
              />
              <h3 className="text-display text-3xl md:text-4xl mb-3">
                Estamos afinando la próxima parada.
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                {T.fechas.intro}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 border border-foreground/30 hover:border-primary hover:text-primary transition text-eyebrow inline-flex items-center gap-2"
                >
                  <MessageCircle size={14} /> Contratar
                </a>
              </div>
            </div>
          ) : (
            <ul className="grid gap-4">
              {events.upcoming.map((e, i) => {
                const d = parseEventDate(e.event_date);
                return (
                  // Boleto de tren: talón con la fecha + cuerpo con el detalle
                  <li
                    key={e.id}
                    className="reveal spotlight ticket group grid grid-cols-[5.5rem_1fr] md:grid-cols-[8rem_1fr] border border-border/60 bg-card/50 hover:border-primary/50 transition-colors"
                    style={{ '--d': `${i * 100}ms` }}
                  >
                    <div className="ticket-stub flex flex-col items-center justify-center py-6 border-r border-dashed border-border/80 bg-primary/[0.06]">
                      <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary">
                        {d.toLocaleDateString('es-CL', { weekday: 'short' })}
                      </div>
                      <div className="text-display text-5xl md:text-6xl leading-none my-1 group-hover:text-primary transition-colors">
                        {d.getDate()}
                      </div>
                      <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {d.toLocaleDateString('es-CL', { month: 'short' })}
                      </div>
                    </div>
                    <div className="p-5 md:p-7 grid md:grid-cols-[1fr_auto] gap-4 md:gap-8 items-center min-w-0">
                      <div className="min-w-0">
                        <div className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                          Boleto · Parada {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="text-display text-2xl md:text-4xl leading-tight">
                          {e.title}
                        </div>
                        {e.venue && e.venue !== e.title && (
                          <div className="text-muted-foreground mt-1">
                            {e.venue}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap md:flex-col md:items-end gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        {(e.city || e.address) && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="text-primary" />{' '}
                            {[e.address, e.city].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {e.event_time && (
                          <span className="font-mono text-xs">
                            {e.event_time} h
                          </span>
                        )}
                        {e.price && (
                          <span className="font-mono text-xs">{e.price}</span>
                        )}
                        {(e.ticket_url || e.source_url) && (
                          <a
                            href={e.ticket_url || e.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-eyebrow text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {e.ticket_url ? 'Entradas' : 'Más info'}{' '}
                            <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {events.past.length > 0 && (
            <div className="mt-16">
              <div className="text-eyebrow mb-5">Ya pasamos por aquí</div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                {events.past.slice(0, 9).map((e) => (
                  <li
                    key={e.id}
                    className="flex items-baseline gap-4 py-3 border-b border-border/40"
                  >
                    <span className="font-mono text-xs text-muted-foreground shrink-0 w-20">
                      {parseEventDate(e.event_date).toLocaleDateString(
                        'es-CL',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }
                      )}
                    </span>
                    <span className="text-foreground/90 truncate">
                      {e.venue || e.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    ),

    blog: (
      <section
        id="blog"
        className="relative py-20 md:py-28 border-t border-border/40"
      >
        <SectionNum n={num.blog} />
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="reveal flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow n={num.blog} className="mb-4">
                {T.blog.eyebrow}
              </Eyebrow>
              <h2 className="text-display text-5xl md:text-7xl">
                <RichTitle text={T.blog.title} />
              </h2>
            </div>
            {posts.length > 0 && (
              <a
                href="#/blog"
                className="text-eyebrow text-primary hover:underline"
              >
                Ver todo el blog →
              </a>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <article
                  key={i}
                  className="border border-dashed border-border/60 p-8 flex flex-col justify-between min-h-[240px]"
                >
                  <div>
                    <div className="font-mono text-xs text-primary mb-4">
                      Próximamente
                    </div>
                    <h3 className="text-display text-2xl mb-2 text-muted-foreground">
                      Post #{i}
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      Historias del camino, sesiones de estudio y crónicas de
                      shows en vivo.
                    </p>
                  </div>
                  <div className="text-eyebrow text-muted-foreground/60 mt-6">
                    — En preparación
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((p, i) => (
                <a
                  key={p.id}
                  href="#/blog"
                  className="reveal spotlight h-[13.5rem] overflow-hidden border border-border/60 p-6 hover:border-primary/40 group flex flex-col"
                  style={{ '--d': `${(i % 3) * 120}ms` }}
                >
                  <div className="font-mono text-xs text-primary mb-2">
                    {formatDate(p.created_at)}
                  </div>
                  <h3 className="text-display text-xl md:text-2xl leading-tight line-clamp-2 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {postExcerpt(p)}
                  </p>
                  <span className="mt-auto pt-3 inline-flex items-center gap-2 text-eyebrow text-primary group-hover:underline">
                    Leer más <ArrowUpRight size={14} />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    ),

    galeria: (
      <section className="relative py-16 md:py-24 bg-smoke-gradient border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="reveal flex items-baseline justify-between mb-6 gap-6 flex-wrap">
            <div>
              <div className="text-eyebrow mb-3">{T.galeria.eyebrow}</div>
              <h2 className="text-display text-4xl md:text-5xl">
                <RichTitle text={T.galeria.title} />
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {T.galeria.intro}
            </p>
          </div>
          <div className="hover-pause relative overflow-hidden border-y border-border/60 py-6">
            <div className="flex gap-6 w-max animate-marquee">
              {[...slides, ...slides, ...slides, ...slides].map((s, i) => (
                <div
                  key={(s.src || '') + 'm' + i}
                  className="group relative w-[280px] md:w-[360px] aspect-[4/5] shrink-0 shadow-deep overflow-hidden"
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    className="photo-warm w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] text-primary uppercase tracking-[0.25em]">
                    {s.caption}
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </div>
        </div>
      </section>
    ),

    noticias: novedades.length > 0 && (
      <section
        id="noticias"
        className="relative py-20 md:py-28 border-t border-border/40"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="reveal mb-12">
            <Eyebrow n={num.noticias}>{T.noticias.eyebrow}</Eyebrow>
            <h2 className="text-display text-5xl md:text-7xl">
              <RichTitle text={T.noticias.title} />
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {novedades.map((n, i) => (
              <article
                key={n.key}
                className="reveal spotlight border border-border/60 p-6 md:p-8 hover:border-primary/40 flex gap-5"
                style={{ '--d': `${(i % 2) * 120}ms` }}
              >
                {n.event && (
                  <div className="shrink-0 w-16 text-center border-r border-border/60 pr-5">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-primary">
                      {parseEventDate(n.event.event_date).toLocaleDateString(
                        'es-CL',
                        { weekday: 'short' }
                      )}
                    </div>
                    <div className="text-display text-4xl leading-none">
                      {parseEventDate(n.event.event_date).getDate()}
                    </div>
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {parseEventDate(n.event.event_date).toLocaleDateString(
                        'es-CL',
                        { month: 'short' }
                      )}
                    </div>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-mono text-xs text-primary mb-3">
                    {n.eyebrow}
                  </div>
                  <h3 className="text-display text-2xl md:text-3xl mb-2">
                    {n.title}
                  </h3>
                  {n.content && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {n.content}
                    </p>
                  )}
                  {n.event && (
                    <a
                      href="#fechas"
                      className="mt-3 inline-flex items-center gap-1 text-eyebrow text-primary hover:underline"
                    >
                      Ver agenda <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),

    apoyo: visibleDonation.length > 0 && (
      <section
        id="apoyo"
        className="relative py-20 md:py-28 bg-smoke-gradient border-t border-border/40"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <Eyebrow n={num.apoyo} className="mb-6">
            {T.apoyo.eyebrow}
          </Eyebrow>
          <h2 className="text-display text-5xl md:text-7xl mb-6">
            <RichTitle text={T.apoyo.title} />
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12">
            {T.apoyo.intro}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {visibleDonation.map((f) => (
              <div key={f.id} className="border border-border/60 p-5">
                <div className="text-eyebrow mb-1">{f.field_key}</div>
                <div className="font-mono text-sm md:text-base break-all">
                  {f.field_value}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={copyDonation}
            className="btn-shine mt-8 px-8 py-4 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform"
          >
            Copiar datos
          </button>
        </div>
      </section>
    ),

    contacto: (
      <section
        id="contacto"
        className="relative py-20 md:py-28 border-t border-border/40"
      >
        <SectionNum n={num.contacto} />
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="reveal text-center mb-12">
            <Eyebrow n={num.contacto} className="mb-6">
              {T.contacto.eyebrow}
            </Eyebrow>
            <h2 className="text-display text-5xl md:text-7xl mb-6">
              <RichTitle text={T.contacto.title} />
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {T.contacto.intro}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="reveal spotlight lg:col-span-3 border border-border/60 p-6 md:p-10 bg-background/40">
              <ContactForm />
            </div>

            <aside
              className="reveal lg:col-span-2 space-y-3"
              style={{ '--d': '150ms' }}
            >
              <a
                href={`mailto:${emailAddr}`}
                className="spotlight block p-5 border border-border/60 hover:border-primary/60 transition group"
              >
                <div className="text-eyebrow mb-1">Email</div>
                <div className="font-mono text-xs md:text-sm break-all group-hover:text-primary transition">
                  {emailAddr}
                </div>
              </a>
              {contact.phone && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="spotlight block p-5 border border-border/60 hover:border-primary/60 transition group"
                >
                  <div className="text-eyebrow mb-1">WhatsApp</div>
                  <div className="font-mono text-sm group-hover:text-primary transition inline-flex items-center gap-2">
                    <MessageCircle size={14} /> +{contact.phone}
                  </div>
                </a>
              )}
              <a
                href={SPOTIFY_URL}
                target="_blank"
                rel="noreferrer"
                className="spotlight block p-5 border border-border/60 hover:border-primary/60 transition group"
              >
                <div className="text-eyebrow mb-1">Escúchanos</div>
                <div className="font-mono text-sm group-hover:text-primary transition">
                  Spotify · Tren de Medianoche
                </div>
              </a>
              {socialLinks.length > 0 && (
                <div className="p-5 border border-border/60">
                  <div className="text-eyebrow mb-3">Redes</div>
                  <SocialRow links={socialLinks} variant="solid" />
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    )
  };

  return (
    <main
      ref={rootRef}
      className="lovable-root relative overflow-hidden"
      onClick={handleAnchorClick}
      onPointerMove={handleSpotlight}
    >
      {/* NAV */}
      <SiteNav ticker={ticker} visible={sectionOrder} />

      {/* HERO — titular editorial a pantalla completa */}
      <section
        id="top"
        className="relative min-h-[100svh] flex flex-col justify-end"
      >
        <div className="absolute inset-0">
          {slides.map((s, i) => (
            <img
              key={(s.src || '') + i}
              src={s.src}
              alt={s.alt}
              className={`absolute inset-0 w-full h-full object-cover object-[center_30%] animate-slow-pan transition-opacity duration-[1600ms] ease-in-out ${
                i === slide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-spotlight" />
        </div>

        {/* Locomotora del logo como sello grande (escritorio). La animación va en
            el contenedor: hero-in termina en opacidad 1 y anularía la del logo.
            Con mix-blend-screen solo se ven las líneas claras, como en el menú. */}
        <div
          aria-hidden="true"
          className="hero-in hidden xl:block absolute right-[6%] top-32 w-[22rem] mix-blend-screen pointer-events-none"
          style={{ '--d': '700ms' }}
        >
          <img src={logoMark} alt="" className="w-full invert opacity-50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-36 lg:pt-44 pb-10 md:pb-14 w-full">
          <div
            className="hero-in text-eyebrow mb-6 md:mb-8 inline-flex items-center gap-3"
            style={{ '--d': '100ms' }}
          >
            <span className="h-px w-8 bg-primary" />
            {T.hero.eyebrow}
          </div>

          <h1 className="text-display text-[clamp(3.6rem,13.5vw,11.5rem)] leading-[0.82]">
            {T.hero.title.split('\n').map((line, i) => (
              <span
                key={i}
                className={`hero-in block ${i > 0 ? 'pl-[0.45em]' : ''}`}
                style={{ '--d': `${200 + i * 150}ms` }}
              >
                <RichTitle text={line} />
              </span>
            ))}
          </h1>

          <div className="mt-10 md:mt-14 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <p
              className="hero-in lg:col-span-6 xl:col-span-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
              style={{ '--d': '550ms' }}
            >
              <RichTitle text={T.hero.intro} />
            </p>

            <div
              className="hero-in lg:col-span-6 xl:col-span-4 flex gap-3 lg:justify-end xl:justify-start"
              style={{ '--d': '650ms' }}
            >
              <a
                href="#lanzamiento"
                className="btn-shine flex-1 lg:flex-none px-5 sm:px-8 py-4 whitespace-nowrap bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform text-center inline-flex items-center justify-center gap-2"
              >
                <Play
                  size={12}
                  fill="currentColor"
                  className="hidden sm:block"
                />{' '}
                Escuchar
              </a>
              <a
                href="#fechas"
                className="flex-1 lg:flex-none px-5 sm:px-8 py-4 whitespace-nowrap border border-foreground/30 text-foreground text-eyebrow hover:border-primary hover:text-primary transition text-center"
              >
                Ver fechas
              </a>
            </div>

            {/* Tarjeta "Ahora suena" con el último lanzamiento */}
            <a
              href="#lanzamiento"
              className="hero-in spotlight hidden xl:flex xl:col-span-3 items-center gap-4 p-4 border border-border/70 bg-background/80 hover:border-primary/60 transition-colors"
              style={{ '--d': '800ms' }}
            >
              <div className="shrink-0 w-14 h-14 bg-ember-gradient flex items-center justify-center text-primary-foreground">
                {songCover ? (
                  <img
                    src={songCover}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-eyebrow text-[0.62rem]">
                  <span className="eq" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  Ahora suena
                </div>
                <div className="text-display text-2xl leading-tight truncate mt-1">
                  {latestTitle}
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Barra inferior: datos de la banda + contador de fotos */}
        <div className="relative z-10 border-t border-border/50 bg-background/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-6">
            <dl className="flex gap-5 sm:gap-7 md:gap-14">
              {[
                ['2017', 'Fundación'],
                [String(releaseList.length), 'Lanzamientos'],
                [String(memberList.length), 'Músicos']
              ].map(([n, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-display text-2xl md:text-3xl text-primary">
                    {n}
                  </dd>
                  <span className="font-mono text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {l}
                  </span>
                </div>
              ))}
            </dl>
            <div className="hidden sm:flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                <span className="text-foreground">
                  {String(slide + 1).padStart(2, '0')}
                </span>{' '}
                / {String(slides.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={(s.src || '') + 'dot' + i}
                    onClick={() => setSlide(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    className={`h-[2px] transition-all ${
                      i === slide
                        ? 'w-10 bg-primary'
                        : 'w-5 bg-foreground/30 hover:bg-foreground/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* En móvil la barra de avisos va aquí; en escritorio, bajo el menú */}
          <NewsTicker items={ticker} className="py-3 lg:hidden" />
        </div>
      </section>

      {sectionOrder.map((key) => (
        <Fragment key={key}>{blocks[key]}</Fragment>
      ))}

      {/* FOOTER */}
      <SiteFooter />
    </main>
  );
}
