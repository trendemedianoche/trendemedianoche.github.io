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
          <a href="#media" onClick={closeMenu}>Galería</a>
          <a href="#about" onClick={closeMenu}>Historia</a>
          <a href="#music" onClick={closeMenu}>Música</a>
          <a href="#news" onClick={closeMenu}>Noticias</a>
          <a href="#contact" onClick={closeMenu}>Contacto</a>
        </nav>
      </header>

      <ExtraNewsBar />
    </>
  );
}
