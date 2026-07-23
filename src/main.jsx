// Tema nuevo (Tailwind 4 + diseño Lovable) para la landing pública.
// El CSS antiguo del sitio se importa en las rutas que aún lo usan
// (/blog y /admin) para no contaminar la nueva home.
import './styles/lovable-theme.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
