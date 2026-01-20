# 🎵 Guía de Diseño - Tren de Medianoche

## Nuevo Diseño Inspirado en Metallica

Este documento describe el nuevo diseño implementado para el sitio web, inspirado en la estructura visual de **Metallica.com**.

---

## 📐 Estructura de Diseño

### 1. **Section Dividers (Divisiones de Contenido)**

Las imágenes están integradas dentro de las divisiones de contenido, creando un efecto visual impactante similar al sitio de Metallica.

#### Características:
- **Altura**: 400px (responsive en móvil)
- **Fondo**: Imagen con parallax effect
- **Overlay**: Gradiente oscuro para mejor legibilidad
- **Contenido**: Título y descripción centrados

#### Uso en App.jsx:
```jsx
<SectionDivider
  id="gallery"
  image={imageUrl}
  caption="Galería"
  description="Descubre nuestra galería de fotos"
/>
```

#### Tabla de Bases de Datos Requerida:
```sql
CREATE TABLE section_dividers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  position INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE section_descriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎛️ Panel Admin Homologado

El nuevo panel admin tiene un diseño unificado con un sistema de pestañas moderno.

### Características:

#### **Header Moderno**
- Título con emoji y subtítulo
- Botón de logout con gradiente
- Bordes dorados (#f5c400) inspirados en Metallica

#### **Sidebar Navigation**
- 7 pestañas principales
- Sistema de iconos + labels
- Indicador visual de tab activo
- Ancho: 240px (responsive)

#### **Pestañas Disponibles:**
1. **💬 Chat** - Gestión de chat en vivo
2. **🖼️ Fotos** - Gestión de galería
3. **📑 Secciones** - Editar divisiones de contenido
4. **📰 Noticias** - Gestión de noticias
5. **⭐ Extra** - Noticias extras
6. **❤️ Donaciones** - Gestión de donaciones
7. **👥 Usuarios** - Gestión de usuarios (admin)

### Estructura del Layout:
```
┌─────────────────────────────────────────────┐
│         🎵 Admin · Tren de Medianoche      │ <- AdminHeader
├──────────┬──────────────────────────────────┤
│   SIDEBAR│        CONTENIDO PRINCIPAL      │
│  (240px) │                                  │
│          │   - ComponenteAdmin activo      │
│   Tabs   │   - Scrolleable                 │
│   Nav    │   - Max-width: 1400px           │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

---

## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|--------|-----|
| Negro | #000000 | Fondo principal |
| Gris Oscuro | #0b0b0b | Fondos secundarios |
| Gris Claro | #f5f5f5 | Texto principal |
| Dorado | #f5c400 | Acentos, bordes, activos |
| Gris Neutro | #bbb | Texto secundario |
| Rojo | #b30000 | Botones de logout |

---

## 📱 Responsive Design

### Breakpoints:

#### **Desktop** (> 1024px)
- Sidebar: 240px, vertical
- Header: Full width
- Content: Padding 2rem

#### **Tablet** (768px - 1024px)
- Sidebar: 200px, vertical
- Font sizes: Reducidos
- Contenido: Padding 1.5rem

#### **Móvil** (< 768px)
- Sidebar: 100% width, horizontal
- Altura: 80px máximo
- Tabs con solo iconos
- Content: Padding 1rem

---

## 🔄 Flujo de Datos

```
┌─────────────────────┐
│  App.jsx (Home)     │
│  - SiteProvider     │
└──────────┬──────────┘
           │
    ┌──────▼─────────┐
    │  SiteContext   │
    │ - Dividers     │
    │ - Descriptions │
    └──────┬─────────┘
           │
    ┌──────▼────────────┐
    │ SectionDivider    │
    │ + Components      │
    └───────────────────┘
```

### Admin Flow:
```
AdminPanel
├── AdminHeader
└── AdminContainer
    ├── Sidebar (nav)
    └── Content (tab actual)
```

---

## 📚 Archivos Nuevos Creados

### Componentes:
- ✅ `src/components/SectionDivider.jsx` - División de contenido
- ✅ `src/context/SiteContext.jsx` - Context global del sitio

### Estilos:
- ✅ `src/styles/SectionDivider.css` - Estilos de divisiones
- ✅ `src/styles/AdminPanel-Modern.css` - Layout moderno del admin
- ✅ `src/styles/AdminHeader-Modern.css` - Header del admin

### Servicios:
- ✅ `src/services/sectionImagesService.js` - CRUD de divisiones
- ✅ `src/services/sectionDescriptionsService.js` - CRUD de descripciones

### Actualizaciones:
- ✅ `src/App.jsx` - Import de SectionDivider y estilos
- ✅ `src/admin/AdminPanel.jsx` - Nuevo layout con sidebar
- ✅ `src/admin/AdminHeader.jsx` - Header simplificado
- ✅ `src/styles/base.css` - Scrollbar y mejoras globales

---

## 🚀 Próximos Pasos

### Para el Cliente:
1. **Crear tablas en Supabase** según el SQL mostrado arriba
2. **Agregar imágenes divisoras** a través del admin en "Secciones"
3. **Agregar descripciones** de secciones en el admin

### Para Desarrollo:
1. Integrar componentes de admin individuales si necesitan mejoras visuales
2. Ajustar responsive según pruebas en móviles
3. Considerar animaciones adicionales si es necesario

---

## 💡 Notas Importantes

- El diseño usa `background-attachment: fixed` para paralax (desactivado en móvil)
- Los colores dorados (#f5c400) son la identidad visual del nuevo diseño
- El admin ahora tiene un solo diseño unificado que cambia según la pestaña
- Todas las transiciones son suaves (0.3s ease)
- El scrollbar personalizado está disponible en toda la aplicación

---

## 📞 Soporte

Para preguntas sobre la implementación, consultar los comentarios en:
- `AdminPanel-Modern.css` - Layout y estructura
- `SectionDivider.css` - Estilos de divisiones
- `AdminHeader-Modern.css` - Estilos del header
