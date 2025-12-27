import React from 'react';
import PhotoAdmin from './PhotoAdmin';

// Placeholder para módulos futuros
function SettingsEditor() {
  return (
    <div>
      <h2>Editar textos y valores</h2>
      <p>Aquí puedes agregar tu formulario para editar textos del sitio.</p>
    </div>
  );
}

function SectionManager() {
  return (
    <div>
      <h2>Gestión de secciones</h2>
      <p>Aquí puedes agregar tu módulo para administrar secciones dinámicas.</p>
    </div>
  );
}

export default function AdminPanel() {
  console.log('AdminPanel cargado'); // Para depuración
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Administración</h1>

      <SettingsEditor />

      <PhotoAdmin />

      <SectionManager />
    </div>
  );
}
