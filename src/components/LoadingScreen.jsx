import logoMark from '../assets/logo-mark.png';

export default function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--background, #0a0a0a)' }}
    >
      <img
        src={logoMark}
        alt="Tren de Medianoche"
        className="w-16 h-16 invert opacity-90 animate-pulse"
      />
      <span className="text-eyebrow">Cargando…</span>
    </div>
  );
}
