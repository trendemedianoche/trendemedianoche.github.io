import { useEffect, useState } from 'react';
import { getGalleryImages } from '../services/galleryService';

export default function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    getGalleryImages().then(setImages);
  }, []);

  return (
    <section id="media" className="gallery-section">
      <div className="gallery-grid">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt={img.alt || 'Tren de Medianoche'}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
