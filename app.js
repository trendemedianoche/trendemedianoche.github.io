const chatButton = document.getElementById("chat-button");
const chatPopup = document.getElementById("chat-popup");
const chatClose = document.getElementById("chat-close");

chatButton.addEventListener("click", () => {
  chatPopup.classList.toggle("hidden");
});

chatClose.addEventListener("click", () => {
  chatPopup.classList.add("hidden");
});

// Envío del formulario
document.getElementById("chat-form").addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    nombre: nombre.value,
    email: email.value,
    mensaje: mensaje.value,
    fecha: new Date().toISOString()
  };

  // Guardar local (opcional)
  const mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];
  mensajes.push(data);
  localStorage.setItem("mensajes", JSON.stringify(mensajes));

  alert("Mensaje enviado");
  e.target.reset();
  chatPopup.classList.add("hidden");
});
