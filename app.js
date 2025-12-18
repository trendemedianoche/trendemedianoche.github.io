document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    fecha: new Date().toISOString()
  };

  // Obtener datos previos
  const registros = JSON.parse(localStorage.getItem("formularios")) || [];

  // Agregar nuevo
  registros.push(data);

  // Guardar como JSON
  localStorage.setItem("formularios", JSON.stringify(registros));

  alert("Datos guardados localmente");
  this.reset();
});
