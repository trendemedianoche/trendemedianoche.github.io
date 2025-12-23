import logoFooter from '../assets/logo_2.png';
import whatsapp from '../assets/whatsapp.png';
import instagram from '../assets/instagram-new.png';
import facebook from '../assets/facebook-new.png';
import youtube from '../assets/youtube.png';

export default function Footer() {
  return (
     <footer id="contact" className="footer">
         <div className="footer-columns">
            <div className="footer-block footer-logo-column">
               <img src={logoFooter} alt="Tren de Medianoche" />
            </div>
            <div className="footer-block footer-text">
               <h3>Tren de Medianoche</h3>
               <p>
                  Banda chilena de blues rock fundada en 2017.
                  Canciones originales en español inspiradas en la noche,
                  el viaje y la vida cotidiana.
               </p>
            </div>

            <div className="footer-block footer-text">
               <h3>Contacto</h3>
               <div className="contact-row">
                  <img src={whatsapp} alt="WhatsApp" />
                  <a href="https://wa.me/56963223241" target="_blank">
                  +56 9 6322 3241
                  </a>
               </div>
               <div className="contact-row">
                  ✉️
                  <a href="mailto:bandatrendemedianoche@gmail.com">
                  bandatrendemedianoche@gmail.com
                  </a>
               </div>
            </div>
            <div className="footer-block footer-text">
               <h3>Redes Sociales</h3>
               <div className="footer-socials">
                  <a href="https://www.instagram.com/trendemedianoche_oficial/" target="_blank">
                  <img src={instagram} alt="Instagram" />
                  </a>
                  <a href="https://www.facebook.com/bandaTDMN" target="_blank">
                  <img src={facebook} alt="Facebook" />
                  </a>
                  <a href="https://youtube.com/@trendemedianochechile4904" target="_blank">
                  <img src={youtube} alt="YouTube" />
                  </a>
               </div>
            </div>
         </div>
         <p className="footer-copy">
            © Tren de Medianoche — Todos los derechos reservados
         </p>
      </footer>
  );
}
