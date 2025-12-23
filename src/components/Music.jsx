import song from '../assets/sientes_como.mp3';

export default function Music() {
  return (
    <section id="music" className="music-section">
      <h2 className="section-title">Música</h2>

      {/* Ultimo lanzamiento */}
      <div className="release-spotlight">
        <div className="release-meta">
          <span className="release-label">Último lanzamiento</span>
          <h3 className="release-title">Sientes Cómo</h3>
          <p className="release-subtitle">Single · Tren de Medianoche</p>
        </div>

        <div className="release-player">
          <audio controls preload="metadata">
            <source src={song} type="audio/mpeg" />
            Tu navegador no soporta audio.
          </audio>
        </div>
      </div>

      {/* SPOTIFY */}
      <div className="music-card spotify-card">
        <h3>Sigue escuchándonos en Spotify</h3>

        <iframe
          src="https://open.spotify.com/embed/artist/2ZRyGZfKgNjNKbry4Aqv7J?theme=0"
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </section>
  );
}
