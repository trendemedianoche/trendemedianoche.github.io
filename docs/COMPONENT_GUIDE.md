# 🎨 Guía de Componentes Admin

## Introducción

Este documento explica cómo usar el sistema unificado de componentes AdminComponents.css en el panel de administración.

---

## 1️⃣ Estructura Base: `.admin-card`

Todo contenido debe estar dentro de un `.admin-card`:

```jsx
<div className="admin-card">
  <div className="admin-card-header">
    <h2 className="admin-card-title"> Noticias</h2>
  </div>
  
  <div className="admin-card-body">
    {/* contenido aquí */}
  </div>
</div>
```

**Resultado visual:**
- Fondo oscuro (#1a1a1a)
- Borde gris (#333)
- Borde izquierdo dorado (#f5c400)
- Transición smooth en hover

---

## 2️⃣ Formularios: `.form-group`

```jsx
<form className="admin-form">
  <div className="form-group">
    <label htmlFor="title">Título</label>
    <input 
      id="title"
      type="text" 
      placeholder="Ingresa el título"
    />
  </div>

  <div className="form-group">
    <label htmlFor="content">Contenido</label>
    <textarea 
      id="content"
      placeholder="Ingresa el contenido"
      style={{ minHeight: '120px' }}
    />
  </div>

  <button className="btn btn-primary btn-block">Guardar</button>
</form>
```

**Características:**
- Label dorado (#f5c400)
- Input con hover efectivo
- Focus state con sombra dorada
- Padding y radius consistentes

---

## 3️⃣ Botones

### Primario
```jsx
<button className="btn btn-primary">Crear</button>
```
Fondo dorado gradient, ideal para acciones principales.

### Secundario
```jsx
<button className="btn btn-secondary">Cancelar</button>
```
Fondo gris con borde dorado, para acciones secundarias.

### Peligro
```jsx
<button className="btn btn-danger">Eliminar</button>
```
Fondo rojo gradient, para acciones destructivas.

### Éxito
```jsx
<button className="btn btn-success">Activar</button>
```
Fondo verde gradient, para acciones positivas.

### Tamaños y Variantes
```jsx
<button className="btn btn-primary btn-small">Pequeño</button>
<button className="btn btn-primary btn-block">Ancho completo</button>
<button className="btn btn-primary" disabled>Deshabilitado</button>
```

---

## 4️⃣ Items de Lista: `.item-card`

```jsx
<div className="item-card">
  <div className="item-header">
    <strong>Título del Item</strong>
    <span className="badge badge-active">Activo</span>
  </div>
  
  <p style={{ margin: '0.5rem 0 0 0' }}>
    Descripción o contenido del item
  </p>
  
  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
    <button className="btn btn-secondary btn-small">Editar</button>
    <button className="btn btn-danger btn-small">Eliminar</button>
  </div>
</div>
```

**Características:**
- Borde izquierdo dorado (#f5c400)
- Fondo oscuro con hover efectivo
- Flexible para diferentes contenidos

---

## 5️⃣ Badges: `.badge`

```jsx
<span className="badge badge-active">Activo</span>
<span className="badge badge-inactive">Inactivo</span>
<span className="badge badge-warning">Pendiente</span>
<span className="badge badge-danger">Error</span>
```

**Usos:**
- Indicar estado (activo/inactivo)
- Mostrar categorías
- Etiquetado rápido de items

---

## 6️⃣ Estados Vacío: `.empty-state`

```jsx
{items.length === 0 ? (
  <div className="empty-state">
    <div className="empty-state-icon"></div>
    <p className="empty-state-text">No hay noticias</p>
  </div>
) : (
  /* lista de items */
)}
```

---

## 7️⃣ Estado de Carga: `.loading-spinner`

```jsx
{loading && (
  <div className="empty-state">
    <div className="loading-spinner" />
    <p className="empty-state-text">Cargando...</p>
  </div>
)}
```

---

## 8️⃣ Alertas: `.admin-alert`

```jsx
<div className="admin-alert alert-success">
   Cambios guardados correctamente
</div>

<div className="admin-alert alert-error">
  ❌ Error al guardar los cambios
</div>

<div className="admin-alert alert-info">
  ℹ️ Esta acción es irreversible
</div>

<div className="admin-alert alert-warning">
  ⚠️ Verifica los datos antes de continuar
</div>
```

---

## 📋 Ejemplo Completo: Administrador de Noticias

```jsx
import { useEffect, useState } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '../services/newsService';
import '../styles/AdminComponents.css';

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getNews();
    setNews(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (editing) {
      await updateNews(editing.id, form);
    } else {
      await createNews(form);
    }
    
    setForm({ title: '', content: '' });
    setEditing(null);
    load();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* FORMULARIO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            {editing ? '✏️ Editar' : '➕ Nueva Noticia'}
          </h2>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              placeholder="Título de la noticia"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Contenido</label>
            <textarea
              placeholder="Contenido de la noticia"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              style={{ minHeight: '150px' }}
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? '⏳ Guardando...' : editing ? '✓ Actualizar' : '✓ Crear'}
          </button>

          {editing && (
            <button
              className="btn btn-secondary btn-block"
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ title: '', content: '' });
              }}
            >
              ✕ Cancelar
            </button>
          )}
        </form>
      </div>

      {/* LISTADO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title"> Noticias ({news.length})</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p className="empty-state-text">Cargando...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p className="empty-state-text">No hay noticias</p>
          </div>
        ) : (
          <div className="admin-card-body">
            {news.map((n) => (
              <div key={n.id} className="item-card">
                <strong>{n.title}</strong>
                <p style={{ margin: '0.5rem 0 1rem 0', color: '#999' }}>
                  {n.content.substring(0, 60)}...
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      setEditing(n);
                      setForm(n);
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => deleteNews(n.id).then(load)}
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Buenas Prácticas

1. **Siempre usar `.admin-card`** para agrupar contenido
2. **Usar `.form-group`** para inputs organizados
3. **Aplicar estados** loading y empty para mejor UX
4. **Mantener consistencia** de espaciado (gap: '1rem', margin: '0.5rem')
5. **Usar clases de tamaño** (.btn-small, .btn-block)
6. **Badges para estados** en lugar de solo texto
7. **Flexbox para acciones** en items (`display: 'flex', gap: '0.5rem'`)

---

## 🎨 Color Reference

- **Dorado:** `#f5c400` - Accents, highlights, borders
- **Fondo oscuro:** `#0d0d0d` - Body background
- **Fondo cards:** `#1a1a1a` - Card backgrounds
- **Texto principal:** `#f5f5f5` - Primary text
- **Texto secundario:** `#bbb` / `#999` - Secondary text
- **Borde:** `#333` - Borders
- **Verde (éxito):** `#00a300`
- **Rojo (peligro):** `#b30000`

---

## 📌 Referencia Rápida

```jsx
// Card wrapper
<div className="admin-card">
  <div className="admin-card-header">
    <h2 className="admin-card-title">🎵 Título</h2>
  </div>
  <div className="admin-card-body">
    {/* content */}
  </div>
</div>

// Form
<form className="admin-form">
  <div className="form-group">
    <label>Label</label>
    <input placeholder="..." />
  </div>
  <button className="btn btn-primary btn-block">Guardar</button>
</form>

// Button variations
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary btn-small">Secondary Small</button>
<button className="btn btn-danger">Danger</button>

// Item in list
<div className="item-card">
  <strong>Título</strong>
  <span className="badge badge-active">Activo</span>
  <div style={{display: 'flex', gap: '0.5rem'}}>
    <button className="btn btn-secondary btn-small">Editar</button>
  </div>
</div>

// Empty & Loading
<div className="empty-state">
  <div className="loading-spinner" />
  <p className="empty-state-text">Cargando...</p>
</div>
```

---

**Última actualización:** 2024  
**Versión:** 1.0 - Sistema completo de componentes

