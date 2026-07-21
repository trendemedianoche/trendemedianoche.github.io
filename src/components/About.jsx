import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { getAbout } from '../services/aboutService';

export default function About() {
  const [content, setContent] = useState('');

  useEffect(() => {
    getAbout().then(setContent);
  }, []);

  return (
    <section id="about" className="about-section">
      <div
        className="about-container"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
    </section>
  );
}
