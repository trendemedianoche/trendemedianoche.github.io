import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Visor a pantalla completa para las fotos de la galería.
// Cierra con Esc, clic fuera de la foto o la X; ← → para navegar.
export default function Lightbox({ images, index, onClose, onChange }) {
  const closeRef = useRef(null);
  const total = images.length;
  const img = images[index];

  const go = (dir) => onChange((index + dir + total) % total);

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && total > 1) go(1);
      else if (e.key === 'ArrowLeft' && total > 1) go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!img) return null;

  const btn =
    'absolute z-10 grid place-items-center w-11 h-11 rounded-full bg-background/70 text-foreground border border-border/60 hover:border-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
      onClick={onClose}
    >
      <img
        src={img.src}
        alt={img.alt}
        className="max-w-full max-h-full object-contain shadow-deep"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        ref={closeRef}
        type="button"
        className={`${btn} top-4 right-4`}
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${btn} left-3 md:left-6 top-1/2 -translate-y-1/2`}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className={`${btn} right-3 md:right-6 top-1/2 -translate-y-1/2`}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Foto siguiente"
          >
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground tracking-[0.2em]">
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
