import { useState } from 'react';
import ExtraNewsBar from './ExtraNewsBar.jsx';
import logo from '../assets/logo.png';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    closeMenu();
    
    // Si estamos en la página del blog, volver a la principal primero
    const currentPath = window.location.hash;
    if (currentPath.includes('/blog')) {
      // Ir a la página principal con el hash de la sección
      window.location.hash = '#/' + targetId;
      setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } else {
      // Ya estamos en la página principal, solo hacer scroll
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  };

  const handleBlogClick = (e) => {
    e.preventDefault();
    closeMenu();
    window.location.hash = '#/blog';
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    closeMenu();
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <div className="logo-combo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="logo-icon"></div>
          <div className="logo-text"></div>
        </div>

        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <a href="#media" onClick={(e) => handleNavClick(e, '#media')}>Galería</a>
          <a href="#about" onClick={(e) => handleNavClick(e, '#about')}>Historia</a>
          <a href="#music" onClick={(e) => handleNavClick(e, '#music')}>Música</a>
          <a href="#news" onClick={(e) => handleNavClick(e, '#news')}>Noticias</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contacto</a>
          <a href="/blog" onClick={handleBlogClick}>Blog</a>
        </nav>
      </div>
      
      <ExtraNewsBar />
    </header>
  );
}
