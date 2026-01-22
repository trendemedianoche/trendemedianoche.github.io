import { useEffect, useState } from 'react';
import { getGalleryImages } from '../services/galleryService';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [nextHeroImage, setNextHeroImage] = useState(null);

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

  const heroImage = images.length ? images[heroIndex % images.length] : null;

  // Precargar la siguiente imagen
  useEffect(() => {
    if (!images.length || !heroImage) return;
    
    const img = new Image();
    img.src = heroImage.url;
    img.onload = () => setHeroImageLoaded(true);
    
    return () => {
      setHeroImageLoaded(false);
    };
  }, [heroImage, images.length]);

  const handleHeroNext = () => {
    if (!images.length) return;
    const nextIndex = (heroIndex + 1) % images.length;
    const nextImg = images[nextIndex];
    
    // Precargar imagen antes de cambiar
    const img = new Image();
    img.src = nextImg.url;
    img.onload = () => {
      setHeroIndex(nextIndex);
    };
  };

  const handleHeroPrev = () => {
    if (!images.length) return;
    const prevIndex = (heroIndex - 1 + images.length) % images.length;
    const prevImg = images[prevIndex];
    
    // Precargar imagen antes de cambiar
    const img = new Image();
    img.src = prevImg.url;
    img.onload = () => {
      setHeroIndex(prevIndex);
    };
  };

  // autoplay cada 3s con precarga
  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => {
      const nextIndex = (heroIndex + 1) % images.length;
      const nextImg = images[nextIndex];
      
      // Precargar imagen antes de cambiar
      const img = new Image();
      img.src = nextImg.url;
      img.onload = () => {
        setHeroIndex(nextIndex);
      };
    }, 3000);
    return () => clearInterval(id);
  }, [images.length, heroIndex]);

  return (
    <>
      <section id="media" className="gallery-section">
        {heroImage && (
          <div
            className="media-cta-container"
            style={{ backgroundImage: `url(${heroImage.url})` }}
            onClick={() => setSelectedImage(heroImage)}
            role="button"
            aria-label="Ver foto"
          >
            <div className="media-cta-overlay" onClick={() => setSelectedImage(heroImage)}></div>
          </div>
        )}
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
