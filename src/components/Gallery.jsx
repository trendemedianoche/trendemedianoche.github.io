import galleryData from '../data/gallery.json';

export default function Gallery() {
  return (
    <section id="media" className="gallery-section">
      <div className="gallery-grid">
        {galleryData.images.map((img, i) => (
          <img
            key={i}
            src={`../src/assets/${img.src}`}
            alt={img.alt}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}

//import img1 from '../assets/323288311_553218996680854_8275761172948079720_n.jpg';