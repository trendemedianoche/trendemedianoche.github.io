import newsData from '../../data/news.json';
import DonateCard from '../../components/DonateCard.jsx';

export default function News() {
  return (
    <section id="news" className="news-section">
      <h2 className="section-title">Noticias & Comunidad</h2>

      <div className="news-layout">
        {/* COLUMNA IZQUIERDA */}
        <div className="news-content">
          {newsData.news.map((item, i) => (
            <article key={i} className="side-card news-item">
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
