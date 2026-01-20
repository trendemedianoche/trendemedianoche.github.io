# 🗄️ Configuración de Base de Datos - Supabase

## Tablas Requeridas para el Nuevo Diseño

Para que el nuevo diseño funcione correctamente, necesitas crear estas dos tablas en tu base de datos Supabase.

---

## 1️⃣ Tabla: `section_dividers`

Esta tabla almacena las imágenes divisoras entre secciones.

### SQL para crear la tabla:

```sql
CREATE TABLE section_dividers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  position INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_section_dividers_section_key ON section_dividers(section_key);
CREATE INDEX idx_section_dividers_position ON section_dividers(position);
```

### Campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGINT | ID único (auto-generado) |
| `section_key` | VARCHAR(50) | Clave única de la sección (ej: 'gallery', 'news', 'about') |
| `image_url` | TEXT | URL completa de la imagen |
| `caption` | VARCHAR(255) | Título que aparece en la imagen |
| `position` | INT | Orden de aparición |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Ejemplo de datos:

```sql
INSERT INTO section_dividers (section_key, image_url, caption, position) VALUES
('gallery', 'https://example.com/gallery.jpg', 'Galería de Fotos', 1),
('news', 'https://example.com/news.jpg', 'Últimas Noticias', 2),
('about', 'https://example.com/about.jpg', 'Nuestra Historia', 3),
('music', 'https://example.com/music.jpg', 'Música en Vivo', 4);
```

---

## 2️⃣ Tabla: `section_descriptions`

Esta tabla almacena las descripciones que aparecen en las divisiones.

### SQL para crear la tabla:

```sql
CREATE TABLE section_descriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (section_key) REFERENCES section_dividers(section_key) ON DELETE CASCADE
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_section_descriptions_section_key ON section_descriptions(section_key);
```

### Campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGINT | ID único (auto-generado) |
| `section_key` | VARCHAR(50) | Clave única de la sección (referencia a section_dividers) |
| `description` | TEXT | Descripción que aparece debajo del título |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Ejemplo de datos:

```sql
INSERT INTO section_descriptions (section_key, description) VALUES
('gallery', 'Explora nuestro archivo de fotografías exclusivas'),
('news', 'Mantente actualizado con las últimas noticias'),
('about', 'Conoce la historia detrás de Tren de Medianoche'),
('music', 'Escucha nuestras mejores interpretaciones en vivo');
```

---

## 🔐 Políticas de Seguridad (RLS)

### Para `section_dividers`:

```sql
-- Permitir lectura pública
CREATE POLICY "Enable read access on section_dividers"
  ON section_dividers FOR SELECT
  USING (true);

-- Permitir escritura solo a usuarios autenticados
CREATE POLICY "Enable insert for authenticated users only"
  ON section_dividers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Enable update for authenticated users only"
  ON section_dividers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Enable delete for authenticated users only"
  ON section_dividers FOR DELETE
  USING (auth.role() = 'authenticated');

-- Habilitar RLS
ALTER TABLE section_dividers ENABLE ROW LEVEL SECURITY;
```

### Para `section_descriptions`:

```sql
-- Permitir lectura pública
CREATE POLICY "Enable read access on section_descriptions"
  ON section_descriptions FOR SELECT
  USING (true);

-- Permitir escritura solo a usuarios autenticados
CREATE POLICY "Enable insert for authenticated users only"
  ON section_descriptions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Enable update for authenticated users only"
  ON section_descriptions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Enable delete for authenticated users only"
  ON section_descriptions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Habilitar RLS
ALTER TABLE section_descriptions ENABLE ROW LEVEL SECURITY;
```

---

## 📝 Pasos para Implementar

### 1. En la consola Supabase:

1. Ve a **SQL Editor**
2. Crea una nueva consulta
3. Copia y ejecuta el SQL de cada tabla (una por una)
4. Ejecuta las políticas de seguridad

### 2. En el Admin del sitio:

Una vez creadas las tablas, ve a la sección **"Secciones"** del panel admin para:
- Agregar nuevas divisiones
- Editar las existentes
- Cambiar el orden
- Agregar descripciones

### 3. Verifica que funciona:

- La página principal debería cargar las imágenes divisoras
- El admin debería permitir editar las secciones
- Las descripciones deberían aparecer en las divisiones

---

## 🆘 Troubleshooting

### Las imágenes no aparecen:
- ✅ Verifica que las URLs sean completas (http/https)
- ✅ Verifica que las imágenes sean públicas
- ✅ Revisa la consola del navegador (DevTools)

### El admin no permite guardar:
- ✅ Verifica que RLS esté habilitado correctamente
- ✅ Verifica que el usuario esté autenticado
- ✅ Revisa los permisos en Supabase

### Las divisiones no aparecen en el orden correcto:
- ✅ Verifica que la columna `position` esté correctamente setada
- ✅ Usa el admin para reordenar las secciones

---

## 💾 Backup

Antes de hacer cambios, guarda un backup de tus datos:

```sql
-- Exportar section_dividers
SELECT * FROM section_dividers;

-- Exportar section_descriptions
SELECT * FROM section_descriptions;
```

---

## 📞 Notas

- Las URLs de las imágenes deben ser públicas
- Recomendamos usar Supabase Storage para almacenar imágenes
- Las descripciones son opcionales pero recomendadas
- El orden (position) es importante para la visualización
