import img1 from '../assets/323288311_553218996680854_8275761172948079720_n.jpg';
import img2 from '../assets/277157904_944018592979258_5253242053734153907_n.jpeg';
import img3 from '../assets/348441768_550723740593684_8018548674131979303_n.jpg';
import img4 from '../assets/469315191_1594349671198843_2030748612920409032_n.jpg';

export default function Gallery() {
  return (
    <section id="media" className="gallery-section">
      <div className="gallery-grid">
        <img src={img1} alt="Tren de Medianoche en vivo" loading="lazy" />
        <img src={img2} alt="Presentación en escenario" loading="lazy" />
        <img src={img3} alt="Ensayo de la banda" loading="lazy" />
        <img src={img4} alt="Sesión fotográfica" loading="lazy" />
      </div>
    </section>
  );
}


/*
import galleryData from '../data/gallery.json';

export default function Gallery() {
  return (
    <section id="media" className="gallery-section">
      <div className="gallery-grid">
        {galleryData.images.map((img, i) => (
          <img
            key={i}
            src={`${img.src}`}
            alt={img.alt}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
*/
//import img1 from '../assets/323288311_553218996680854_8275761172948079720_n.jpg';