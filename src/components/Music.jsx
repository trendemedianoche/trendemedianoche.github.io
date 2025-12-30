import { useEffect, useState } from 'react';
import { getLatestSong } from '../services/musicService';

export default function Music() {
  const [song, setSong] = useState(null);
  const [audioError, setAudioError] = useState(false);

  const [spotifyLoaded, setSpotifyLoaded] = useState(false);
  const [spotifyAllowed, setSpotifyAllowed] = useState(true);

  useEffect(() => {
    getLatestSong().then(setSong);

    // ⏱️ Si Spotify no carga en 3s → se bloquea
    const timeout = setTimeout(() => {
      if (!spotifyLoaded) setSpotifyAllowed(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [spotifyLoaded]);

  return (
    <section id="music" className="music-section">
      <h2 className="section-title">Música</h2>

      {/* 🎵 CANCIÓN LOCAL */}
      {song?.audioUrl && !audioError && (
        <div className="release-spotlight">
          {song.coverUrl && (
            <div className="release-cover">
              <img src={song.coverUrl} alt={song.title} />
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
            </audio>
          </div>
        </div>
      )}

      {/* 🎧 SPOTIFY — SOLO SI RESPONDE */}
      {spotifyAllowed && (
        <div className="music-card spotify-card">
          <h3>Escúchanos en Spotify</h3>

          <iframe
            src="https://open.spotify.com/embed/artist/2ZRyGZfKgNjNKbry4Aqv7J?theme=0"
            width="100%"
            height="352"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style={{ border: 'none' }}
            onLoad={() => setSpotifyLoaded(true)}
          />
        </div>
      )}
    </section>
  );
}
