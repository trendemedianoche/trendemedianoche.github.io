import extraNews from '../data/extraNews.json';

export default function ExtraNewsBar() {
  return (
    <div className="news-bar">
      <div className="news-label">{extraNews.label}</div>

      <div className="news-marquee">
        <div className="news-track">
          {extraNews.items.map((item, i) => (
            <span key={i} className="news-item-bar">
              {item.icon} {item.text}{' '}
              <strong>{item.highlight}</strong>
              {i < extraNews.items.length - 1 && (
                <span className="separator">
                  {' '}{extraNews.separator}{' '}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
