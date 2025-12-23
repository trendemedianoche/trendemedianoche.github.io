import { useState } from 'react';
import '../styles/chat.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    mensaje: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const messages =
      JSON.parse(localStorage.getItem('chatMessages')) || [];

    messages.push({
      ...form,
      date: new Date().toISOString(),
    });

    localStorage.setItem('chatMessages', JSON.stringify(messages));

    alert('Mensaje enviado 🙌');
    setForm({ nombre: '', email: '', mensaje: '' });
    setOpen(false);
  };

  return (
    <>
      {/* BOTÓN */}
      <div
        id="chat-button"
        onClick={() => setOpen(true)}
        title="Escríbenos"
      >
        💬
      </div>

      {/* POPUP */}
      {open && (
        <div id="chat-popup">
          <div className="chat-header">
            <span>Escríbenos</span>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chat-body">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Tu email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <textarea
                name="mensaje"
                placeholder="Escribe tu mensaje..."
                value={form.mensaje}
                onChange={handleChange}
                required
              />

              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
