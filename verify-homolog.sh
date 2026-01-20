#!/bin/bash
# Script de verificación - Homologación Admin Panel

echo "🔍 VERIFICANDO HOMOLOGACIÓN DEL ADMIN PANEL"
echo "============================================"
echo ""

# 1. Verificar que AdminComponents.css existe
if [ -f "src/styles/AdminComponents.css" ]; then
    echo "✅ AdminComponents.css existe"
else
    echo "❌ AdminComponents.css NO ENCONTRADO"
fi

# 2. Verificar que base.css tiene margin-top
if grep -q "margin-top: 80px" src/styles/base.css; then
    echo "✅ base.css tiene margin-top: 80px"
else
    echo "❌ base.css NO tiene margin-top: 80px"
fi

# 3. Verificar que todos los componentes importan AdminComponents.css
components=(
    "ChatAdmin"
    "PhotoAdmin"
    "NewsAdmin"
    "ExtraNewsAdmin"
    "DonationAdmin"
    "SectionAdmin"
    "UserAdmin"
)

echo ""
echo "Verificando componentes:"
for component in "${components[@]}"; do
    file="src/admin/${component}.jsx"
    if grep -q "AdminComponents.css" "$file"; then
        echo "  ✅ $component importa AdminComponents.css"
    else
        echo "  ❌ $component NO importa AdminComponents.css"
    fi
done

# 4. Verificar que los componentes NO importan CSS antiguos
echo ""
echo "Verificando que NO se importan CSS antiguos:"
for component in "${components[@]}"; do
    file="src/admin/${component}.jsx"
    oldCSS="${component}.css"
    if grep -q "$oldCSS" "$file"; then
        echo "  ⚠️  $component aún importa $oldCSS"
    else
        echo "  ✅ $component no importa $oldCSS"
    fi
done

# 5. Verificar clases reutilizables en AdminComponents.css
echo ""
echo "Verificando clases en AdminComponents.css:"
classes=(
    ".admin-card"
    ".admin-card-header"
    ".admin-card-title"
    ".admin-card-body"
    ".btn-primary"
    ".btn-secondary"
    ".btn-danger"
    ".item-card"
    ".message-item"
    ".empty-state"
    ".loading-spinner"
    ".badge"
)

for class in "${classes[@]}"; do
    if grep -q "$class" "src/styles/AdminComponents.css"; then
        echo "  ✅ Clase $class existe"
    else
        echo "  ❌ Clase $class NO ENCONTRADA"
    fi
done

# 6. Compilar proyecto
echo ""
echo "Compilando proyecto..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Compilación FALLÓ"
fi

echo ""
echo "============================================"
echo "✅ VERIFICACIÓN COMPLETADA"
