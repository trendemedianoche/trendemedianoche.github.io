import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getRecentStories } from '../services/storiesService';

const IMAGE_DURATION = 5000;
const DAY = 24 * 60 * 60 * 1000;

function dayKey(date) {
  return new Date(date).toLocaleDateString('es-CL');
}

function dayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  if (dayKey(d) === dayKey(today)) return 'Hoy';
  if (dayKey(d) === dayKey(today.getTime() - DAY)) return 'Ayer';
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' });
}

function timeAgo(date) {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / (60 * 60 * 1000));
  if (hours < 1) return 'Hace un momento';
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
}

/* ------------------------------ VISOR ------------------------------ */

function StoryViewer({ stories, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const story = stories[index];
  const isVideo = story.media_type === 'VIDEO';

  const next = useCallback(() => {
    if (index < stories.length - 1) setIndex((i) => i + 1);
    else onClose();
  }, [index, stories.length, onClose]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Avance automático de las imágenes
  useEffect(() => {
    setProgress(0);
    if (isVideo) return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = (Date.now() - start) / IMAGE_DURATION;
      if (p >= 1) {
        clearInterval(id);
        next();
      } else {
        setProgress(p);
      }
    }, 50);
    return () => clearInterval(id);
  }, [index, isVideo, next]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [next, prev, onClose]);

  // El enlace a Instagram solo funciona mientras la historia sigue activa (24 h)
  const isLive = Date.now() - new Date(story.taken_at).getTime() < DAY;

  // Portal al body: la portada crea su propio contexto de apilamiento y el menú quedaría encima
  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Historias de Instagram"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground z-10"
        aria-label="Cerrar"
      >
        <X size={26} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        disabled={index === 0}
        className="hidden md:flex absolute left-[calc(50%-17rem)] p-2 text-muted-foreground hover:text-primary disabled:opacity-20"
        aria-label="Anterior"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="hidden md:flex absolute right-[calc(50%-17rem)] p-2 text-muted-foreground hover:text-primary"
        aria-label="Siguiente"
      >
        <ChevronRight size={32} />
      </button>

      <div
        className="relative w-full h-full md:w-auto md:h-[min(88vh,820px)] md:aspect-[9/16] bg-black overflow-hidden md:border md:border-border/60 md:shadow-deep"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            key={story.id}
            src={story.media_url}
            poster={story.thumbnail_url || undefined}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            playsInline
            onTimeUpdate={(e) => setProgress(e.target.currentTime / (e.target.duration || 1))}
            onEnded={next}
          />
        ) : (
          <img
            key={story.id}
            src={story.media_url}
            alt="Historia de Instagram"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Zonas táctiles: izquierda = anterior, derecha = siguiente */}
        <button type="button" className="absolute inset-y-0 left-0 w-1/3" onClick={prev} aria-label="Anterior" />
        <button type="button" className="absolute inset-y-0 right-0 w-2/3" onClick={next} aria-label="Siguiente" />

        <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <div className="flex gap-1">
            {stories.map((s, i) => (
              <div key={s.id} className="h-[2px] flex-1 bg-foreground/25 overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${i < index ? 100 : i === index ? progress * 100 : 0}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 pr-10 md:pr-0 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.18em] text-foreground/85">
            <span>Tren de Medianoche</span>
            <span>{timeAgo(story.taken_at)}</span>
          </div>
        </div>

        {isLive && story.permalink && (
          <a
            href={story.permalink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1 px-4 py-2 border border-foreground/30 bg-black/50 backdrop-blur-sm text-eyebrow text-foreground hover:border-primary hover:text-primary transition"
          >
            Ver en Instagram <ArrowUpRight size={13} />
          </a>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------ FRANJA ------------------------------ */

export default function StoriesStrip() {
  const [stories, setStories] = useState([]);
  const [openAt, setOpenAt] = useState(null);

  useEffect(() => {
    getRecentStories().then(setStories);
  }, []);

  if (!stories.length) return null;

  // Un círculo por día, el más reciente primero
  const days = [];
  stories.forEach((s, i) => {
    const key = dayKey(s.taken_at);
    const day = days.find((d) => d.key === key);
    if (day) day.last = s;
    else days.push({ key, firstIndex: i, last: s });
  });
  days.reverse();

  return (
    <>
      <div className="mb-10">
        <div className="text-eyebrow mb-4">En la ruta · Historias</div>
        <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
          {days.map((day) => {
            const cover = day.last.thumbnail_url || (day.last.media_type === 'IMAGE' ? day.last.media_url : null);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setOpenAt(day.firstIndex)}
                className="group shrink-0 flex flex-col items-center gap-2"
                aria-label={`Ver historias de ${dayLabel(day.last.taken_at)}`}
              >
                <span className="block p-[2px] rounded-full bg-ember-gradient shadow-ember transition-transform group-hover:scale-105">
                  <span className="block p-[2px] rounded-full bg-background">
                    {cover ? (
                      <img src={cover} alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover" />
                    ) : (
                      <span className="block w-14 h-14 md:w-16 md:h-16 rounded-full bg-smoke" />
                    )}
                  </span>
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground">
                  {dayLabel(day.last.taken_at)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {openAt !== null && (
        <StoryViewer stories={stories} startIndex={openAt} onClose={() => setOpenAt(null)} />
      )}
    </>
  );
}
