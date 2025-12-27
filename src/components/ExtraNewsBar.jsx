import { useEffect, useState } from 'react';
import { getExtraNewsItems } from '../services/extraNewsService';

export default function ExtraNewsBar() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getExtraNewsItems().then(setItems);
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
                dangerouslySetInnerHTML={{ __html: item.content }}
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
