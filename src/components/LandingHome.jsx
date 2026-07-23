import { useEffect, useRef, useState } from 'react';
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

import { getGalleryImages } from '../services/galleryService';
import { getAbout } from '../services/aboutService';
import { getLatestSong } from '../services/musicService';
import { getExtraNewsItems } from '../services/extraNewsService';
import { getBlogPosts } from '../services/blogService';
import { sendChatMessage } from '../services/chatService';
import { getNews } from '../services/newsService';
import { getTransferData } from '../services/donationService';
import { getReleases } from '../services/releasesService';
import { getTopTracks } from '../services/topTracksService';
import { getBandMembers } from '../services/bandMembersService';
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
import logoText from '../assets/logo-text.png';
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
  { name: 'Manuel Mercado', role: 'Guitarra & Voz', note: 'Compositor principal' },
  {
    name: 'Ricardo Mizraji',
    role: 'Armónica, Teclado & Coros',
    note: 'Hohner Marine Band'
  },
  { name: 'José Antil', role: 'Guitarra, Armónica & Coros', note: 'Slide & rítmica' }
];

const releases = [
  { year: '2024', title: 'Sientes Cómo', type: 'Single', note: 'Último lanzamiento' },
  { year: '2023', title: 'Cuatro Patitas', type: 'Single', note: 'Historia de adopción' },
  { year: '2023', title: 'Carta a mis amigos', type: 'Single', note: 'En memoria de H. Briceño' },
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
  { year: '2021', title: 'Desde la Otra Ruta', type: 'EP', note: 'Producido por Johnny Espina' },
  { year: '2021', title: 'Mi Mejor Regalo', type: 'Single', note: 'Con Nehemías Muñoz en saxofón' },
  {
    year: '2018',
    title: 'Arriba de la Locomotora',
    type: 'EP',
    note: 'Producido por Cristian Olivares'
  },
  { year: '2018', title: 'Santa se Llevó a Mi Chica', type: 'Single', note: 'Single navideño' }
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

const shows = [];

const FALLBACK_SLIDES = [
  { src: bandBar1, alt: 'Tren de Medianoche en la barra', caption: 'En la barra · Santiago' },
  { src: bandBar2, alt: 'Tren de Medianoche sentados en el bar', caption: 'Antes del show' },
  { src: bandTracks, alt: 'Tren de Medianoche sobre las vías', caption: 'En las vías · Cordillera' }
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
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DEFAULT_TRACK_ID = '4GZ6PL2ci4VAUgGAlQ4qoo'; // Sientes Cómo

function extractSpotifyId(url) {
  if (!url) return null;
  const m = String(url).match(/track\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
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
          className="w-full sm:w-auto px-8 py-4 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform disabled:opacity-60"
        >
          {status === 'sending' ? 'Enviando…' : 'Enviar mensaje →'}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------ PÁGINA ------------------------------ */

export default function LandingHome() {
  const [slide, setSlide] = useState(0);

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
    dragRef.current = { down: true, startX: e.pageX, scrollLeft: el.scrollLeft };
  };
  const onDragMove = (e) => {
    const el = timelineRef.current;
    if (!el || !dragRef.current.down) return;
    e.preventDefault();
    el.scrollLeft = dragRef.current.scrollLeft - (e.pageX - dragRef.current.startX);
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

  useEffect(() => {
    getGalleryImages().then(setGallery).catch(() => {});
    getNews().then(setNewsItems).catch(() => {});
    getTransferData().then(setDonationFields).catch(() => {});
    getAbout().then(setAboutHtml).catch(() => {});
    getLatestSong().then(setSong).catch(() => {});
    getExtraNewsItems()
      .then((items) => setExtraNews(items.filter((i) => i.active !== false)))
      .catch(() => {});
    getBlogPosts().then(setPosts).catch(() => {});
    getFooterContactData().then(setContact).catch(() => {});
    getFooterSocialNetworks().then(setSocials).catch(() => {});
    getReleases().then(setReleasesData).catch(() => {});
    getTopTracks().then(setTracksData).catch(() => {});
    getBandMembers().then(setMembersData).catch(() => {});
  }, []);

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
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 7000);
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
    const text = visibleDonation.map((f) => `${f.field_key}: ${f.field_value}`).join('\n');
    navigator.clipboard?.writeText(text);
  };

  const emailAddr = contact.email || 'bandatrendemedianoche@gmail.com';
  const whatsappUrl = contact.phone
    ? `https://wa.me/${contact.phone}`
    : 'https://api.whatsapp.com/send/?phone=56963223241';

  return (
    <main className="lovable-root relative overflow-hidden" onClick={handleAnchorClick}>
      {/* NAV */}
      <SiteNav />

      {/* HERO */}
      <section id="top" className="relative min-h-screen flex items-end">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-spotlight" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-24 pt-40 w-full">
          <div className="text-eyebrow mb-8 animate-flicker">Est. 2017 · Blues Chileno</div>
          <div className="mb-6 max-w-[150px] sm:max-w-[210px] md:max-w-xs flex flex-col items-center drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <img src={logoMark} alt="" className="w-2/3 h-auto invert opacity-95" />
            <img src={logoText} alt="Tren de Medianoche" className="w-full h-auto invert opacity-95 mt-3" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            {slides.map((s, i) => (
              <button
                key={(s.src || '') + 'dot' + i}
                onClick={() => setSlide(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className={`h-[2px] transition-all ${
                  i === slide ? 'w-12 bg-primary' : 'w-6 bg-foreground/30 hover:bg-foreground/60'
                }`}
              />
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-8 items-end">
            <p className="md:col-span-2 text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Composición original e improvisación en español. Blues electroacústico que conecta al
              ser humano con su entorno, su ciudad y la vida cotidiana.
            </p>
            <div className="flex gap-4">
              <a
                href="#lanzamiento"
                className="flex-1 md:flex-none px-8 py-4 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform text-center"
              >
                Nuevo single
              </a>
              <a
                href="#contacto"
                className="flex-1 md:flex-none px-8 py-4 border border-foreground/30 text-foreground text-eyebrow hover:border-primary hover:text-primary transition text-center"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-background/70 backdrop-blur-sm py-3 overflow-hidden">
          <div className="flex gap-12 text-eyebrow whitespace-nowrap animate-marquee w-max">
            {[0, 1, 2, 3].map((rep) => (
              <span key={rep} className="flex gap-12 shrink-0">
                {ticker.map((item, i) => (
                  <span
                    key={rep + '-' + i}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(`${item.icon || '★'} ${item.content || ''}`)
                    }}
                  />
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ÚLTIMO LANZAMIENTO — destacado */}
      <section id="lanzamiento" className="relative py-24 md:py-32 border-t border-border/40 bg-smoke-gradient">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="text-eyebrow mb-4 animate-flicker">▶ Último lanzamiento</div>
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
                className="px-6 py-3 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform inline-flex items-center gap-2"
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
          <div className="lg:col-span-7">
            <div className="relative shadow-deep rounded-md border border-border/60 bg-card/40 p-5 md:p-6">
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
                  <h3 className="text-display text-3xl md:text-4xl mb-1 truncate">{latestTitle}</h3>
                  <p className="font-mono text-xs text-muted-foreground mb-4">{latestSubtitle}</p>
                  <audio controls preload="metadata" src={songAudio} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section id="historia" className="relative py-32 md:py-48 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <img
              src={slides[1]?.src || trainNight}
              alt="Tren de Medianoche"
              loading="lazy"
              className="w-full aspect-square object-cover object-top shadow-deep"
            />
          </div>
          <div className="md:col-span-7">
            <div className="text-eyebrow mb-6">— Historia</div>
            <h2 className="text-display text-5xl md:text-7xl leading-[0.95] mb-8">
              Blues que viaja
              <br />
              <span className="italic text-primary">en español.</span>
            </h2>
            <div
              className="space-y-5 text-muted-foreground leading-relaxed [&_p]:mb-4 [&_a]:text-primary"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(aboutHtml || ABOUT_FALLBACK)
              }}
            />

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { n: '2017', l: 'Fundación' },
                { n: '2', l: 'EPs' },
                { n: '10+', l: 'Singles' }
              ].map((s) => (
                <div key={s.l} className="border-t border-primary/40 pt-4">
                  <div className="text-display text-4xl md:text-5xl text-primary">{s.n}</div>
                  <div className="text-eyebrow mt-2">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MÚSICA */}
      <section id="musica" className="relative py-32 md:py-48 bg-smoke-gradient border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-eyebrow mb-4">Discografía</div>
              <h2 className="text-display text-5xl md:text-7xl">
                Nuestro <span className="italic text-primary">recorrido.</span>
              </h2>
            </div>
            <a href={SPOTIFY_URL} target="_blank" rel="noreferrer" className="text-eyebrow text-primary hover:underline">
              Ver perfil completo →
            </a>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 min-h-[420px]">
              <img
                src={slides[1]?.src || slides[0]?.src || guitarImg}
                alt="Tren de Medianoche"
                loading="lazy"
                className="w-full h-full object-cover object-top shadow-deep"
              />
            </div>

            <div className="lg:col-span-3">
              <div className="text-eyebrow mb-4">Canciones · escúchalas</div>
              <ol className="divide-y divide-border/60 border-y border-border/60">
                {trackList.map((t, i) => {
                  const num = String(t.position ?? t.n ?? i + 1).padStart(2, '0');
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
                      <span className="shrink-0 w-6 font-mono text-xs text-primary">{num}</span>
                      <span className="flex-1 min-w-0 text-display text-xl md:text-2xl truncate">
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

          <div className="mt-24">
            <div className="flex items-center justify-between gap-4 mb-10">
              <div className="text-eyebrow">Línea de tiempo</div>
              <div className="text-eyebrow text-muted-foreground hidden md:block">desliza →</div>
            </div>

            {/* Móvil: línea de tiempo VERTICAL */}
            <div className="md:hidden relative border-l border-border/60 ml-1.5">
              {releaseList.map((r) => (
                <div key={r.id ?? r.title} className="relative pl-6 pb-8 last:pb-0">
                  <span className="absolute left-0 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-ember" />
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-mono text-sm text-primary">{r.year}</span>
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
                className="overflow-x-auto pt-4 pb-4 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="relative flex gap-6 min-w-max pr-10">
                  {/* Línea horizontal continua */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-border/60" />
                  {releaseList.map((r) => (
                    <div key={r.id ?? r.title} className="relative w-60 shrink-0 pt-8 group">
                      <span className="absolute top-0 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-ember" />
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="font-mono text-sm text-primary">{r.year}</span>
                        <span className="text-eyebrow">{r.type}</span>
                      </div>
                      <h3 className="text-display text-2xl mt-1 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{r.note}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* BANDA */}
      <section id="banda" className="relative py-32 md:py-48 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="text-eyebrow mb-4">La banda</div>
            <h2 className="text-display text-5xl md:text-6xl mb-8">
              Tres músicos,
              <br />
              <span className="italic text-primary">un mismo tren.</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={slides[0]?.src || guitarImg}
                alt="Tren de Medianoche"
                loading="lazy"
                className="w-full aspect-square object-cover object-top shadow-deep"
              />
              <img
                src={slides[2]?.src || harmonicaImg}
                alt="Tren de Medianoche"
                loading="lazy"
                className="w-full aspect-square object-cover object-top shadow-deep translate-y-8"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-2 self-center">
            {memberList.map((m, i) => (
              <div
                key={m.id ?? m.name}
                className="group border border-border/60 p-6 md:p-8 hover:border-primary/60 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-display text-3xl md:text-4xl">{m.name}</h3>
                  </div>
                  <span className="text-eyebrow">{m.role}</span>
                </div>
                {m.note && (
                  <p className="font-mono text-xs text-muted-foreground mt-3 pl-8">{m.note}</p>
                )}
              </div>
            ))}

            <p className="text-muted-foreground text-sm leading-relaxed mt-8 border-l-2 border-primary/40 pl-6">
              Hemos contado con colaboraciones de{' '}
              <span className="text-foreground">César Díaz Bilbao</span>,{' '}
              <span className="text-foreground">Marcelo Pizarro</span> y{' '}
              <span className="text-foreground">Nehemías Muñoz</span>, entre otros músicos de la
              escena nacional.
            </p>
          </div>
        </div>
      </section>

      {/* FECHAS EN VIVO */}
      <section id="fechas" className="relative py-32 md:py-40 bg-smoke-gradient border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="text-eyebrow mb-4">Agenda</div>
              <h2 className="text-display text-5xl md:text-7xl">
                Próximas <span className="italic text-primary">fechas.</span>
              </h2>
            </div>
          </div>

          {shows.length === 0 ? (
            <div className="border border-dashed border-border/60 p-12 md:p-16 text-center">
              <Calendar className="mx-auto mb-6 text-primary" size={40} strokeWidth={1.2} />
              <h3 className="text-display text-3xl md:text-4xl mb-3">
                Estamos afinando la próxima parada.
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Aún no hay fechas confirmadas publicadas aquí. Escríbenos para contrataciones.
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
            <ul className="divide-y divide-border/60 border-y border-border/60">
              {shows.map((s, i) => (
                <li
                  key={i}
                  className="grid md:grid-cols-12 gap-4 items-center py-6 px-2 hover:bg-primary/5 transition"
                >
                  <div className="md:col-span-3 font-mono text-xs text-primary">{s.date}</div>
                  <div className="md:col-span-5 text-display text-2xl md:text-3xl">{s.venue}</div>
                  <div className="md:col-span-3 text-muted-foreground text-sm inline-flex items-center gap-2">
                    <MapPin size={14} /> {s.city}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="relative py-32 md:py-40 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="text-eyebrow mb-4">Bitácora</div>
              <h2 className="text-display text-5xl md:text-7xl">
                Notas desde <span className="italic text-primary">el vagón.</span>
              </h2>
            </div>
            {posts.length > 0 && (
              <a href="#/blog" className="text-eyebrow text-primary hover:underline">
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
                    <div className="font-mono text-xs text-primary mb-4">Próximamente</div>
                    <h3 className="text-display text-2xl mb-2 text-muted-foreground">Post #{i}</h3>
                    <p className="text-sm text-muted-foreground/70">
                      Historias del camino, sesiones de estudio y crónicas de shows en vivo.
                    </p>
                  </div>
                  <div className="text-eyebrow text-muted-foreground/60 mt-6">— En preparación</div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((p) => (
                <a
                  key={p.id}
                  href="#/blog"
                  className="border border-border/60 p-8 hover:border-primary/60 hover:bg-primary/5 transition group flex flex-col"
                >
                  <div className="font-mono text-xs text-primary mb-4">
                    {formatDate(p.created_at)}
                  </div>
                  <h3 className="text-display text-2xl md:text-3xl mb-3">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                    {stripHtml(p.content).slice(0, 160)}…
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-eyebrow text-primary group-hover:underline">
                    Leer más <ArrowUpRight size={14} />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PRÓXIMO LANZAMIENTO / MARQUEE */}
      <section className="relative py-24 md:py-32 bg-smoke-gradient border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-baseline justify-between mb-6 gap-6 flex-wrap">
            <div>
              <div className="text-eyebrow mb-3">▶ Galería</div>
              <h2 className="text-display text-4xl md:text-5xl">Del bar a las vías.</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Postales del tren mientras seguimos rodando por los escenarios.
            </p>
          </div>
          <div className="relative overflow-hidden border-y border-border/60 py-6">
            <div className="flex gap-6 w-max animate-marquee">
              {[...slides, ...slides, ...slides, ...slides].map((s, i) => (
                <div
                  key={(s.src || '') + 'm' + i}
                  className="relative w-[280px] md:w-[360px] aspect-[4/5] shrink-0 shadow-deep"
                >
                  <img src={s.src} alt={s.alt} className="w-full h-full object-cover object-top" loading="lazy" />
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

      {/* NOTICIAS (solo si hay) */}
      {newsItems.length > 0 && (
        <section id="noticias" className="relative py-32 md:py-40 border-t border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="mb-14">
              <div className="text-eyebrow mb-4">Novedades</div>
              <h2 className="text-display text-5xl md:text-7xl">
                Lo último del <span className="italic text-primary">tren.</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {newsItems.map((n) => (
                <article
                  key={n.id}
                  className="border border-border/60 p-6 md:p-8 hover:border-primary/60 hover:bg-primary/5 transition-all"
                >
                  {n.date && (
                    <div className="font-mono text-xs text-primary mb-3">{formatDate(n.date)}</div>
                  )}
                  <h3 className="text-display text-2xl md:text-3xl mb-2">{n.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{n.content}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* APOYA EL PROYECTO (solo si hay datos de transferencia) */}
      {visibleDonation.length > 0 && (
        <section id="apoyo" className="relative py-32 md:py-40 bg-smoke-gradient border-t border-border/40">
          <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
            <div className="text-eyebrow mb-6">Apóyanos</div>
            <h2 className="text-display text-5xl md:text-7xl mb-6">
              Apoya el <span className="italic text-primary">proyecto.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-12">
              Si quieres apoyar nuestro trabajo y futuras producciones, puedes hacerlo mediante
              transferencia bancaria.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-left">
              {visibleDonation.map((f) => (
                <div key={f.id} className="border border-border/60 p-5">
                  <div className="text-eyebrow mb-1">{f.field_key}</div>
                  <div className="font-mono text-sm md:text-base break-all">{f.field_value}</div>
                </div>
              ))}
            </div>
            <button
              onClick={copyDonation}
              className="mt-8 px-8 py-4 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform"
            >
              Copiar datos
            </button>
          </div>
        </section>
      )}

      {/* CONTACTO */}
      <section id="contacto" className="relative py-32 md:py-40 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <div className="text-eyebrow mb-6">Contacto</div>
            <h2 className="text-display text-5xl md:text-7xl mb-6">
              ¿Nos <span className="italic text-primary">subimos</span> al tren?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Contratación de shows, prensa, colaboraciones y notas. Escríbenos y respondemos con la
              misma pasión con la que tocamos.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 border border-border/60 p-6 md:p-10 bg-background/40">
              <ContactForm />
            </div>

            <aside className="lg:col-span-2 space-y-3">
              <a href={`mailto:${emailAddr}`} className="block p-5 border border-border/60 hover:border-primary transition group">
                <div className="text-eyebrow mb-1">Email</div>
                <div className="font-mono text-xs md:text-sm break-all group-hover:text-primary transition">
                  {emailAddr}
                </div>
              </a>
              {contact.phone && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block p-5 border border-border/60 hover:border-primary transition group">
                  <div className="text-eyebrow mb-1">WhatsApp</div>
                  <div className="font-mono text-sm group-hover:text-primary transition inline-flex items-center gap-2">
                    <MessageCircle size={14} /> +{contact.phone}
                  </div>
                </a>
              )}
              <a href={SPOTIFY_URL} target="_blank" rel="noreferrer" className="block p-5 border border-border/60 hover:border-primary transition group">
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

      {/* FOOTER */}
      <SiteFooter />
    </main>
  );
}
