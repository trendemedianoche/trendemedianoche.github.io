import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/PhotoAdmin.css';
import visible from '../assets/visible.png';
import no_visible from '../assets/no_visible.svg';

const BUCKET = 'trendemedianoche_assets';

export default function PhotoAdmin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  /* ==========================
     HELPERS
  ========================== */
  const shortName = (path) => {
    const name = path.split('/').pop();
    if (!name) return '';
    return name.length > 18
      ? `${name.slice(0, 10)}…${name.slice(-6)}`
      : name;
  };

  /* ==========================
     LOAD
  ========================== */
  const loadImages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      setMessage('Error cargando imágenes');
      setLoading(false);
      return;
    }

    const withUrls = await Promise.all(
      data.map(async (img) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(img.path, 3600);

        return signed
          ? { ...img, url: signed.signedUrl }
          : null;
      })
    );

    setImages(withUrls.filter(Boolean));
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  /* ==========================
     CANCEL FILE
  ========================== */
  const handleCancel = () => {
    setFile(null);
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ==========================
     UPLOAD
  ========================== */
  const handleUpload = async () => {
    if (!file) {
      setMessage('Selecciona una imagen');
      return;
    }

    setLoading(true);
    const filePath = `images/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const maxPosition = Math.max(0, ...images.map(i => i.position || 0));

    await supabase.from('gallery_images').insert({
      path: filePath,
      position: maxPosition + 1,
      active: true
    });

    handleCancel();
    setMessage('Imagen subida correctamente');
    setLoading(false);
    loadImages();
  };

  /* ==========================
     TOGGLE ACTIVE
  ========================== */
  const toggleActive = async (img) => {
    setLoading(true);
    await supabase
      .from('gallery_images')
      .update({ active: !img.active })
      .eq('id', img.id);

    loadImages();
  };

  /* ==========================
     MOVE
  ========================== */
  const move = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const current = images[index];
    const target = images[targetIndex];

    setLoading(true);

    await supabase.from('gallery_images').update({ position: -1 }).eq('id', current.id);
    await supabase.from('gallery_images').update({ position: current.position }).eq('id', target.id);
    await supabase.from('gallery_images').update({ position: target.position }).eq('id', current.id);

    loadImages();
  };

  /* ==========================
     DELETE
  ========================== */
  const remove = async (img) => {
    if (!window.confirm('¿Eliminar imagen definitivamente?')) return;

    setLoading(true);
    await supabase.storage.from(BUCKET).remove([img.path]);
    await supabase.from('gallery_images').delete().eq('id', img.id);
    setMessage('Imagen eliminada');
    loadImages();
  };

  /* ==========================
     JSX
  ========================== */
  return (
    <div className="photo-admin">
      <header className="admin-header">
        <h2>Galería · Administración</h2>
        <p>Gestiona imágenes visibles en el sitio</p>
      </header>

      {/* UPLOAD */}
      <div className="upload-panel">
        <label className="upload-box">
          <input
            type="file"
            hidden
            ref={fileInputRef}
            disabled={loading}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <span>➕ Seleccionar imagen</span>
        </label>

        

        <button
          className="primary-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Subiendo…' : 'Subir a galería'}
        </button>

        {/* INFO ARCHIVO */}
        {file && !loading && (
          <div className="file-hint">
            <span>
              📎 Archivo seleccionado: <strong>{shortName(file.name)}</strong>
            </span>
            <button
              type="button"
              className="cancel-file-btn"
              onClick={handleCancel}
              title="Quitar imagen"
            >
              ❌
            </button>
          </div>
        )}
      </div>

      {/* MENSAJES */}
      {message && <p className="message">{message}</p>}
      {loading && <p className="message">Procesando…</p>}

      {/* GRID */}
      <div className="photo-admin-grid">
        {images.map((img, i) => (
          <div key={img.id} className={`photo-card ${!img.active ? 'inactive' : ''}`}>
            <div className="photo-preview">
              {img.url && <img src={img.url} alt={img.path} />}
              {!img.active && <span className="badge">Inactiva</span>}
            </div>

            <div className="photo-info">
              <strong title={img.path}>{shortName(img.path)}</strong>
              <span>{new Date(img.created_at).toLocaleDateString()}</span>
            </div>

            <div className="photo-actions">
              <button onClick={() => move(i, -1)} disabled={loading}>⬅</button>
              <button onClick={() => move(i, 1)} disabled={loading}>➡</button>
              <button className="toggle" onClick={() => toggleActive(img)} disabled={loading}>
                {img.active
                  ? <img src={visible} alt="Visible" className="img" />
                  : <img src={no_visible} alt="No visible" className="img" />}
              </button>
              <button className="danger" onClick={() => remove(img)}>❌</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
