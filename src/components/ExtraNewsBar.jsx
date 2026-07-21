import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { getExtraNewsItems } from '../services/extraNewsService';

export default function ExtraNewsBar() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getExtraNewsItems()
      // Solo mostramos las novedades activas (el admin las puede ocultar)
      .then((data) => setItems(data.filter((item) => item.active !== false)))
      .catch((err) => console.error('Error cargando novedades:', err));
  }, []);

  if (!items.length) return null;

  return (
    <div className="news-bar">
      <div className="news-label">NOVEDADES:</div>

      <div className="news-marquee">
        <div className="news-track">
          {items.map((item, i) => (
            <span key={item.id}>
              {item.icon}{' '}
              <span
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
              />
              {i < items.length - 1 && (
                <span className="separator"> | </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
