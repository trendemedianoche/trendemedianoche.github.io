import { useEffect, useState } from 'react';
import { getNews } from '../../services/newsService';
import DonateCard from '../../components/DonateCard.jsx';

export default function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    getNews().then(setNews);
  }, []);

  return (
    <section id="news" className="news-section">
      <h2 className="section-title">Noticias & Comunidad</h2>

      <div className="news-layout">
        {/* COLUMNA IZQUIERDA */}
        <div className="news-content">
          {news.map((item) => (
            <article key={item.id} className="side-card news-item">
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <span className="news-date">{item.date}</span>
            </article>
          ))}
        </div>

        {/* COLUMNA DERECHA */}
        <aside className="support-aside">
          <DonateCard />
        </aside>
      </div>
    </section>
  );
}
