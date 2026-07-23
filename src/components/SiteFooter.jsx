import { useEffect, useState } from 'react';
import { Instagram, Facebook, Youtube, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import {
  getFooterContactData,
  getFooterSocialNetworks
} from '../services/donationService';
import logoFull from '../assets/logo_2.png';

const SOCIAL_ICONS = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  Youtube,
  WhatsApp: MessageCircle,
  Email: Mail
};

function formatPhone(phone) {
  if (!phone) return '';
  const p = String(phone).replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '+$1 $2 $3 $4');
  return p.startsWith('+') ? p : '+' + phone;
}

export default function SiteFooter() {
  const [contact, setContact] = useState({ email: null, phone: null });
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getFooterContactData().then(setContact).catch(() => {});
    getFooterSocialNetworks().then(setSocials).catch(() => {});
  }, []);

  const emailAddr = contact.email || 'bandatrendemedianoche@gmail.com';
  const whatsappUrl = contact.phone
    ? `https://wa.me/${contact.phone}`
    : 'https://api.whatsapp.com/send/?phone=56963223241';
  const socialLinks = socials.map((s) => ({ name: s.name, url: s.url }));

  return (
    <footer className="border-t border-border/40 pt-16 pb-10 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        {/* Logo */}
        <div className="flex flex-col items-center sm:items-start gap-4">
          <img
            src={logoFull}
            alt="Tren de Medianoche"
            className="w-32 md:w-40 h-auto invert opacity-90"
          />
        </div>

        {/* Descripción */}
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Banda chilena de blues rock fundada en 2017. Canciones originales en español inspiradas
            en la noche, el viaje y la vida cotidiana.
          </p>
        </div>

        {/* Contacto */}
        <div className="text-center sm:text-left">
          <div className="text-eyebrow mb-4">Contacto</div>
          <div className="space-y-3 text-sm inline-flex flex-col items-center sm:items-start">
            {contact.phone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
              >
                <MessageCircle size={15} /> {formatPhone(contact.phone)}
              </a>
            )}
            <a
              href={`mailto:${emailAddr}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition break-all"
            >
              <Mail size={15} /> {emailAddr}
            </a>
          </div>
        </div>

        {/* Redes */}
        <div className="text-center sm:text-left">
          <div className="text-eyebrow mb-4">Redes sociales</div>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {socialLinks.map((l) => {
                const Icon = SOCIAL_ICONS[l.name] || ArrowUpRight;
                return (
                  <a
                    key={l.name + l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={l.name}
                    className="w-11 h-11 flex items-center justify-center border border-border/60 hover:border-primary hover:bg-primary hover:text-primary-foreground text-foreground transition"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12 pt-6 border-t border-border/40">
        <p className="font-mono text-xs text-muted-foreground text-center">
          © 2025 Tren de Medianoche — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
