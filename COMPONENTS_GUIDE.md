# 🎨 Guía de Implementación de Componentes Reutilizables

## Cómo usar AdminComponents.css en tus componentes Admin

Este archivo proporciona clases CSS predefinidas para mantener un diseño consistente en todo el panel admin.

---

## 📋 Ejemplos de Implementación

### 1. Formulario Simple

```jsx
// MyForm.jsx
import '../styles/AdminComponents.css';

export default function MyForm() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para guardar
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Ingresa el nombre"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="usuario@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Escribe una descripción..."
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary btn-block">Guardar</button>
        <button className="btn btn-secondary btn-block">Cancelar</button>
      </div>
    </form>
  );
}
```

---

### 2. Tabla de Datos

```jsx
// DataTable.jsx
import '../styles/AdminComponents.css';

export default function DataTable({ data, onEdit, onDelete }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Registros</h2>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No hay registros</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>
                  <span className={`badge badge-${item.active ? 'active' : 'inactive'}`}>
                    {item.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => onEdit(item)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => onDelete(item.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

### 3. Tarjeta (Card) de Contenido

```jsx
// ContentCard.jsx
import '../styles/AdminComponents.css';

export default function ContentCard({ title, content, onAction, loading }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">{title}</h2>
      </div>

      <div className="admin-card-body">
        <p>{content}</p>

        <button
          className="btn btn-primary"
          onClick={onAction}
          disabled={loading}
        >
          {loading && <span className="loading-spinner" />}
          {loading ? 'Procesando...' : 'Hacer Acción'}
        </button>
      </div>
    </div>
  );
}
```

---

### 4. Sistema de Alertas

```jsx
// AlertExample.jsx
import '../styles/AdminComponents.css';
import { useState } from 'react';

export default function AlertExample() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'success', message: '✓ Guardado exitosamente' },
    { id: 2, type: 'error', message: '✗ Error al guardar' },
    { id: 3, type: 'info', message: 'ℹ Información importante' },
    { id: 4, type: 'warning', message: '⚠ Advertencia' },
  ]);

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`admin-alert alert-${alert.type}`}
        >
          <span>{alert.message}</span>
          <button
            onClick={() => removeAlert(alert.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### 5. Modal/Dialog

```jsx
// ModalExample.jsx
import '../styles/AdminComponents.css';
import { useState } from 'react';

export default function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Abrir Modal
      </button>

      {isOpen && (
        <div className="admin-modal" onClick={() => setIsOpen(false)}>
          <div
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="admin-card-title">Confirmar Acción</h2>
            <p style={{ marginTop: '1rem' }}>
              ¿Estás seguro de que deseas continuar?
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-primary btn-block"
                onClick={() => setIsOpen(false)}
              >
                Confirmar
              </button>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

### 6. Panel Completo

```jsx
// CompletePanelExample.jsx
import '../styles/AdminComponents.css';
import { useState } from 'react';

export default function CompletePanel() {
  const [items, setItems] = useState([
    { id: 1, title: 'Item 1', active: true },
    { id: 2, title: 'Item 2', active: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setItems(items.filter(item => item.id !== id));
      setAlert({
        type: 'success',
        message: '✓ Eliminado exitosamente'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: '✗ Error al eliminar'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {alert && (
        <div className={`admin-alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Gestión de Items</h2>
          <button className="btn btn-primary btn-small">
            Nuevo Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No hay items</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>
                    <span className={`badge badge-${item.active ? 'active' : 'inactive'}`}>
                      {item.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                    >
                      {loading ? <span className="loading-spinner" /> : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Clases Disponibles

### Contenedores
- `.admin-form` - Contenedor de formulario
- `.admin-card` - Tarjeta contenedora
- `.admin-card-header` - Header de la tarjeta
- `.admin-card-body` - Body de la tarjeta

### Grupos de Formulario
- `.form-group` - Grupo de campo
- `label` - Etiqueta del campo
- `input, textarea, select` - Campos de entrada

### Botones
- `.btn` - Botón base
- `.btn-primary` - Botón principal (dorado)
- `.btn-secondary` - Botón secundario
- `.btn-danger` - Botón de peligro (rojo)
- `.btn-success` - Botón de éxito (verde)
- `.btn-small` - Botón pequeño
- `.btn-block` - Botón full width

### Tablas
- `.admin-table` - Tabla estilizada
- `thead` - Encabezado
- `tbody` - Cuerpo

### Estados
- `.badge` - Badge genérico
- `.badge-active` - Badge activo (verde)
- `.badge-inactive` - Badge inactivo (gris)
- `.badge-warning` - Badge advertencia (dorado)
- `.badge-danger` - Badge peligro (rojo)

### Utilidades
- `.loading-spinner` - Spinner de carga
- `.empty-state` - Estado vacío
- `.admin-alert` - Alerta
- `.alert-success` - Alerta de éxito
- `.alert-error` - Alerta de error
- `.alert-info` - Alerta informativa
- `.alert-warning` - Alerta de advertencia

---

## 📐 Responsive

Todas las clases son responsive y se adaptan automáticamente:
- **Desktop**: Estilos completos
- **Tablet**: Tamaños reducidos
- **Móvil**: Estilos optimizados

No necesitas hacer nada especial, los media queries están incluidos. ✨

---

## ✅ Buenas Prácticas

1. **Siempre importa el CSS**: `import '../styles/AdminComponents.css';`
2. **Usa clases base + modificadores**: `.btn.btn-primary`
3. **Mantén consistencia**: Usa las clases predefinidas
4. **Responsive first**: Las clases ya son responsive
5. **Accesibilidad**: Usa `label` y `htmlFor` en formularios

---

## 🚀 Próximo Paso

Ahora puedes aplicar estas clases a todos los componentes admin existentes:
- ChatAdmin
- PhotoAdmin
- NewsAdmin
- ExtraNewsAdmin
- DonationAdmin
- SectionAdmin
- UserAdmin

¡Mantén la consistencia visual en todo el panel! 🎨
