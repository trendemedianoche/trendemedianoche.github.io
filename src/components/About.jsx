import { useEffect, useState } from 'react';
import { getAbout } from '../services/aboutService';

export default function About() {
  const [content, setContent] = useState('');

  useEffect(() => {
    getAbout().then(setContent);
  }, []);

  return (
    <section id="about">
      <div
        className="about-container"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
