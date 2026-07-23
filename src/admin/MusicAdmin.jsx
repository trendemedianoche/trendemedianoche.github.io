import { useEffect, useState } from 'react';
import { getActiveSong, updateSong } from '../services/musicService';
import '../styles/AdminComponents.css';

export default function MusicAdmin() {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    title: '',
    artist: '',
    album: '',
    spotify_url: '',
    youtube_url: ''
  });

  useEffect(() => {
    getActiveSong().then((s) => {
      setSong(s);
      if (s) {
        setForm({
          title: s.title || '',
          artist: s.artist || '',
          album: s.album || '',
          spotify_url: s.spotify_url || '',
          youtube_url: s.youtube_url || ''
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song) return;
    setStatus('Guardando...');
    try {
      await updateSong(song.id, form);
      setStatus('✓ Guardado');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div className="empty-state">
          <div className="loading-spinner" />
          <p className="empty-state-text">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Música</h2>
        </div>
        <p style={{ padding: '1rem', color: '#bbb' }}>
          No hay una canción activa. Crea una en la tabla <code>songs</code> de Supabase (con su
          archivo mp3 y carátula) y aquí podrás editar sus datos y enlaces.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Canción destacada (Último lanzamiento)</h2>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Artista</label>
          <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Álbum / Tipo</label>
          <input value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} placeholder="Single" />
        </div>
        <div className="form-group">
          <label>Link Spotify</label>
          <input value={form.spotify_url} onChange={(e) => setForm({ ...form, spotify_url: e.target.value })} placeholder="https://open.spotify.com/..." />
        </div>
        <div className="form-group">
          <label>Link YouTube</label>
          <input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-block">✓ Guardar</button>
        </div>
        {status && <p style={{ marginTop: '0.5rem', color: '#f5c400' }}>{status}</p>}
      </form>
    </div>
  );
}
