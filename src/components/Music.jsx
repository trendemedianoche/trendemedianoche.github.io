import { useEffect, useState } from 'react';
import { getLatestSong } from '../services/musicService';

export default function Music() {
  const [song, setSong] = useState(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    getLatestSong().then(setSong);
  }, []);

  return (
    <section id="music" className="music-section">
      <h2 className="section-title">Música</h2>

      {/* 🎵 BLOQUE CANCIÓN */}
      {song?.audioUrl && !audioError && (
        <div className="release-spotlight">
          {/* 🖼️ PORTADA */}
          {song.coverUrl && (
            <div className="release-cover">
              <img src={song.coverUrl} alt={`Portada ${song.title}`} />
            </div>
          )}

          <div className="release-content">
            <div className="release-meta">
              <span className="release-label">Último lanzamiento</span>
              <h3 className="release-title">{song.title}</h3>
              <p className="release-subtitle">
                {song.album} · {song.artist}
              </p>
            </div>

            <audio
              controls
              preload="metadata"
              onError={() => setAudioError(true)}
            >
              <source src={song.audioUrl} type="audio/mpeg" />
              Tu navegador no soporta audio.
            </audio>
          </div>
        </div>
      )}

      {/* 🎧 SPOTIFY (SIEMPRE) */}
      <div className="music-card spotify-card">
        <h3>Escúchanos en Spotify</h3>
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
