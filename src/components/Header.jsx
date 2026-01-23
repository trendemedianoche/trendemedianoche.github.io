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
    
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <>
      {/* HEADER */}
      
      <header className="main-header">

        
        <div className="logo-combo">
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
        </nav>
      </header>

      <ExtraNewsBar />
    </>
  );
}
