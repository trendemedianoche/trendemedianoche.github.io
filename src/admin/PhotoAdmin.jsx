import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  GALLERY_BUCKET as BUCKET,
  PUBLIC_BUCKET,
  resolveImageUrl
} from '../services/galleryService';
import { slugifyFilename, toWebpVariants } from '../lib/imageTransform';
import visible from '../assets/visible.png';
import no_visible from '../assets/no_visible.svg';

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// Convierte la foto a WebP (-lg 1920 px y -sm 800 px) y la sube al bucket
// público (CDN). Si el navegador no puede convertirla (p. ej. HEIC) o no hay
// permiso en el bucket público, sube al privado como antes.
async function uploadOptimized(file) {
  const converted = await toWebpVariants(file);
  const stamp = Date.now();

  if (converted) {
    const base = `gallery/${stamp}-${slugifyFilename(file.name)}`;
    const note = ` (${kb(converted.originalBytes)} → ${kb(
      converted.variants[0].blob.size
    )} en WebP)`;
    const uploaded = [];
    let failed = false;
    for (const v of converted.variants) {
      const path = `${base}-${v.suffix}.webp`;
      const { error } = await supabase.storage
        .from(PUBLIC_BUCKET)
        .upload(path, v.blob, {
          contentType: 'image/webp',
          cacheControl: '31536000'
        });
      if (error) {
        failed = true;
        break;
      }
      uploaded.push(path);
    }
    if (!failed)
      return { bucket: PUBLIC_BUCKET, path: `${base}-lg.webp`, note };

    // Sin permiso en el bucket público: limpiar y guardar el WebP en el privado
    if (uploaded.length)
      await supabase.storage.from(PUBLIC_BUCKET).remove(uploaded);
    const lg = converted.variants.find((v) => v.suffix === 'lg');
    const path = `images/${stamp}-${slugifyFilename(file.name)}.webp`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, lg.blob, { contentType: 'image/webp' });
    if (error) throw error;
    return { bucket: BUCKET, path, note };
  }

  const path = `images/${stamp}-${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return {
    bucket: BUCKET,
    path,
    note: ' (sin convertir: formato no soportado)'
  };
}

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

    // Las que no cargan se muestran igual (sin miniatura) para poder borrarlas u ordenarlas
    const withUrls = await Promise.all(
      data.map(async (img) => ({ ...img, url: await resolveImageUrl(img) }))
    );

    setImages(withUrls);
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
    try {
      const { bucket, path, note } = await uploadOptimized(file);
      const maxPosition = Math.max(0, ...images.map((i) => i.position || 0));
      const { error } = await supabase.from('gallery_images').insert({
        bucket,
        path,
        position: maxPosition + 1,
        active: true
      });
      if (error) throw error;
      setMessage(`Imagen subida correctamente${note}`);
      setMessageType('success');
    } catch (err) {
      setMessage(err.message || 'No se pudo subir la imagen');
      setMessageType('error');
      setLoading(false);
      return;
    }

    setFile(null);
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
    await supabase
      .from('gallery_images')
      .update({ position: -1 })
      .eq('id', current.id);
    await supabase
      .from('gallery_images')
      .update({ position: current.position })
      .eq('id', target.id);
    await supabase
      .from('gallery_images')
      .update({ position: target.position })
      .eq('id', current.id);
    loadImages();
  };

  const remove = async (img) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    setLoading(true);
    // En el bucket público también existe la variante -sm
    const paths = [img.path];
    if (img.bucket === PUBLIC_BUCKET && img.path.endsWith('-lg.webp'))
      paths.push(img.path.replace(/-lg\.webp$/, '-sm.webp'));
    await supabase.storage.from(img.bucket || BUCKET).remove(paths);
    await supabase.from('gallery_images').delete().eq('id', img.id);
    setMessage('Imagen eliminada');
    setMessageType('success');
    loadImages();
  };

  return (
    <div>
      {message && (
        <div className={`admin-alert alert-${messageType}`}>{message}</div>
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
              <div
                className="item-card"
                style={{ borderLeft: '4px solid var(--primary)' }}
              >
                <strong>Archivo seleccionado:</strong>
                <p>{shortName(file.name)}</p>
              </div>
            )}

            <button
              className="btn btn-primary btn-block"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? 'Subiendo...' : 'Subir Imagen'}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              padding: '1.5rem'
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.id}
                className="item-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 0
                }}
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.path}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: 0,
                      marginBottom: '1rem',
                      opacity: img.active ? 1 : 0.5,
                      border: img.active
                        ? '2px solid var(--primary)'
                        : '2px solid var(--muted-foreground)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '180px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '1rem',
                      fontSize: '0.8rem',
                      color: 'var(--muted-foreground)',
                      border: '2px dashed var(--border)'
                    }}
                  >
                    No se encontró el archivo en {img.bucket || BUCKET}
                  </div>
                )}
                <div style={{ marginBottom: '0.8rem' }}>
                  <strong
                    style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}
                  >
                    {shortName(img.path)}
                  </strong>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.3rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {new Date(img.created_at).toLocaleDateString()}
                    </span>
                    {!img.active && (
                      <span
                        className="badge badge-inactive"
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          background:
                            'color-mix(in oklch, var(--accent) 20%, transparent)',
                          color: 'var(--accent)',
                          borderRadius: 0
                        }}
                      >
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '0.5rem'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, -1)}
                    disabled={loading || i === 0}
                    title="Mover a la izquierda"
                    style={{
                      padding: '0.6rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ⬅
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, 1)}
                    disabled={loading || i === images.length - 1}
                    title="Mover a la derecha"
                    style={{
                      padding: '0.6rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ➡
                  </button>
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => toggleActive(img)}
                    disabled={loading}
                    title={img.active ? 'Ocultar imagen' : 'Mostrar imagen'}
                    style={{
                      padding: '0.6rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {img.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => remove(img)}
                    disabled={loading}
                    title="Eliminar imagen"
                    style={{
                      padding: '0.6rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
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
