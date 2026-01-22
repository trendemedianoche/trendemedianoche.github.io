import { useEffect, useState } from 'react';
import { getFooterContactData, getFooterSocialNetworks } from '../services/donationService';

import logoFooter from '../assets/logo_2.png';
import whatsapp from '../assets/whatsapp.png';
import instagram from '../assets/instagram-new.png';
import facebook from '../assets/facebook-new.png';
import youtube from '../assets/youtube.png';

const socialIcons = {
  Instagram: instagram,
  Facebook: facebook,
  YouTube: youtube
};

const formatPhoneCL = (phone) => {
  if (!phone) return '';
  return phone.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4');
};

export default function Footer() {
  const [email, setEmail] = useState(null);
  const [telefono, setTelefono] = useState(null);
  const [socialNetworks, setSocialNetworks] = useState([]);

  useEffect(() => {
    // Cargar datos de contacto (email y teléfono)
    getFooterContactData().then((data) => {
      setEmail(data.email);
      setTelefono(data.phone);
    });

    // Cargar redes sociales
    getFooterSocialNetworks().then(setSocialNetworks);
  }, []);

  return (
    <footer id="contact" className="footer">
      <div className="footer-columns">

        {/* LOGO */}
        <div className="footer-block footer-logo-column">
          <img src={logoFooter} alt="Tren de Medianoche" />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="footer-block footer-text">
          <h3>Tren de Medianoche</h3>
          <p>
            Banda chilena de blues rock fundada en 2017.
            Canciones originales en español inspiradas en la noche,
            el viaje y la vida cotidiana.
          </p>
        </div>

        {/* CONTACTO */}
        <div className="footer-block footer-text">
          <h3>Contacto</h3>

          <div className="contact-row">
            <img src={whatsapp} alt="WhatsApp" />
            <a
              href={`https://wa.me/${telefono}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              +{formatPhoneCL(telefono)}
            </a>
          </div>

          {email && (
            <div className="contact-row">
              ✉️
              <a href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          )}
        </div>

        {/* REDES SOCIALES */}
        <div className="footer-block footer-text">
          <h3>Redes Sociales</h3>

          <div className="footer-socials">
            {socialNetworks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
              >
                <img src={socialIcons[social.name]} alt={social.name} />
              </a>
            ))}
          </div>
        </div>

      </div>

      <p className="footer-copy">
        © Tren de Medianoche — Todos los derechos reservados
      </p>
    </footer>
  );
}
