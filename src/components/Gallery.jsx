import { useEffect, useState } from 'react';
import { getGalleryImages } from '../services/galleryService';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getGalleryImages().then(setImages);
  }, []);

  const handleImageClick = (img) => {
    setSelectedImage(img);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  return (
    <>
      <section id="media" className="gallery-section">
        <div className="gallery-grid">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={img.alt || 'Tren de Medianoche'}
              loading="lazy"
              onClick={() => handleImageClick(img)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </section>

      {/* MODAL DE IMAGEN EN GRANDE */}
      {selectedImage && (
        <div className="gallery-modal" onClick={handleCloseModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* BOTÓN CERRAR */}
            <button className="gallery-modal-close" onClick={handleCloseModal}>
              ✕
            </button>

            {/* IMAGEN GRANDE */}
            <div className="gallery-modal-image-container">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || 'Tren de Medianoche'}
                className="gallery-modal-image"
              />
            </div>

            {/* CONTROLES DE NAVEGACIÓN */}
            <div className="gallery-modal-controls">
              <button 
                className="gallery-nav-btn gallery-nav-prev" 
                onClick={handlePrevImage}
                title="Imagen anterior"
              >
                ◀
              </button>

              <div className="gallery-modal-info">
                <span>{images.findIndex(img => img.id === selectedImage.id) + 1}</span>
                <span>/</span>
                <span>{images.length}</span>
              </div>

              <button 
                className="gallery-nav-btn gallery-nav-next" 
                onClick={handleNextImage}
                title="Siguiente imagen"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
