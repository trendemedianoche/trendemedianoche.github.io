import { useEffect, useState } from 'react';
import { getGalleryImages } from '../services/galleryService';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryImages()
      .then(setImages)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="media" className="gallery-section">
      {loading && <p className="loading">Cargando galería…</p>}

      <div className="gallery-grid">
        {images.map(img => (
          <img
            key={img.id}
            src={img.url}
            alt={img.alt}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
