import React from 'react';

export default function SectionDivider({ id, image, caption, description }) {
  return (
    <section className="section-divider" id={id}>
      <div 
        className="divider-image"
        style={{
          backgroundImage: image ? `url(${image})` : 'none',
          backgroundColor: image ? 'transparent' : '#1a1a1a'
        }}
      >
        <div className="divider-overlay">
          {caption && (
            <div className="divider-caption">
              <h2>{caption}</h2>
            </div>
          )}
          {description && (
            <div className="divider-description">
              <p>{description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
