import aboutData from '../data/about.json';

export default function About() {
  return (
    <section id="about">
      <div className="about-container">
        {aboutData.about.map((item, i) => (
          <p
            key={i}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        ))}
      </div>
    </section>
  );
}
