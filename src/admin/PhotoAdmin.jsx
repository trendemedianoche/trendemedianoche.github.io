import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/AdminComponents.css';
import visible from '../assets/visible.png';
import no_visible from '../assets/no_visible.svg';

const BUCKET = 'trendemedianoche_assets';

export default function PhotoAdmin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const shortName = (path) => {
    const name = path.split('/').pop();
    return name.length > 20 ? `${name.slice(0, 12)}…${name.slice(-6)}` : name;
  };

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      setMessage('Error cargando imágenes');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const withUrls = await Promise.all(
      data.map(async (img) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(img.path, 3600);
        return signed ? { ...img, url: signed.signedUrl } : null;
      })
    );

    setImages(withUrls.filter(Boolean));
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMessage('Selecciona una imagen');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const filePath = `images/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);

    if (error) {
      setMessage(error.message);
      setMessageType('error');
      setLoading(false);
      return;
    }

    const maxPosition = Math.max(0, ...images.map(i => i.position || 0));

    await supabase.from('gallery_images').insert({
      path: filePath,
      position: maxPosition + 1,
      active: true
    });

    setFile(null);
    setMessage('✓ Imagen subida correctamente');
    setMessageType('success');
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadImages();
  };

  const toggleActive = async (img) => {
    setLoading(true);
    await supabase
      .from('gallery_images')
      .update({ active: !img.active })
      .eq('id', img.id);
    loadImages();
  };

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

  const remove = async (img) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    setLoading(true);
    await supabase.storage.from(BUCKET).remove([img.path]);
    await supabase.from('gallery_images').delete().eq('id', img.id);
    setMessage('✓ Imagen eliminada');
    setMessageType('success');
    loadImages();
  };

  return (
    <div>
      {message && (
        <div className={`admin-alert alert-${messageType}`}>
          {message}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title"> Galería</h2>
        </div>

        <div className="admin-card-body">
          <div className="admin-form" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="photo-upload">Seleccionar Imagen</label>
              <input
                id="photo-upload"
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                accept="image/*"
              />
            </div>

            {file && (
              <div className="item-card" style={{ borderLeft: '4px solid #00a300' }}>
                <strong>Archivo seleccionado:</strong>
                <p>{shortName(file.name)}</p>
              </div>
            )}

            <button
              className="btn btn-primary btn-block"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? '⏳ Subiendo...' : '📤 Subir Imagen'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Imágenes ({images.length})</h2>
        </div>

        {images.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p className="empty-state-text">No hay imágenes en la galería</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem'
          }}>
            {images.map((img, i) => (
              <div key={img.id} className="item-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {img.url && (
                  <img
                    src={img.url}
                    alt={img.path}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '0.8rem',
                      opacity: img.active ? 1 : 0.5
                    }}
                  />
                )}
                <strong style={{ fontSize: '0.9rem' }}>{shortName(img.path)}</strong>
                <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                  {new Date(img.created_at).toLocaleDateString()}
                </span>
                {!img.active && <span className="badge badge-inactive">Inactiva</span>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, -1)}
                    disabled={loading || i === 0}
                    title="Subir"
                  >
                    ⬆
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, 1)}
                    disabled={loading || i === images.length - 1}
                    title="Bajar"
                  >
                    ⬇
                  </button>
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => toggleActive(img)}
                    disabled={loading}
                    title={img.active ? 'Ocultar' : 'Mostrar'}
                  >
                    {img.active ? '👁' : '🚫'}
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => remove(img)}
                    disabled={loading}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
