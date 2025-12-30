import { useState } from "react";
import logo from "../assets/logo.png";

export default function AdminHeader({ activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <header className="main-header admin-header">
      {/* LOGO */}
      <div className="logo-combo">
        <div className="logo-icon"></div>
        <div className="logo-text"></div>
      </div>

      {/* HAMBURGER */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menú admin"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* NAV ADMIN */}
      <nav className={`nav ${menuOpen ? "active" : ""}`}>
        <button
          className={activeTab === "photos" ? "active" : ""}
          onClick={() => handleTab("photos")}
        >
          Galería
        </button>

        <button
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => handleTab("settings")}
        >
          Textos
        </button>

        <button
          className={activeTab === "sections" ? "active" : ""}
          onClick={() => handleTab("sections")}
        >
          Secciones
        </button>
        <button
          className={activeTab === "news" ? "active" : ""}
          onClick={() => handleTab("news")}
        >
          Noticias
        </button>
      </nav>
    </header>
  );
}
