import { useState } from 'react';
import { sendChatMessage } from '../services/chatService';
import '../styles/ChatWidget.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendChatMessage(form);
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* BOTÓN */}
      <button className="chat-fab" onClick={() => setOpen(!open)}>
        
      </button>

      {/* WIDGET */}
      {open && (
        <div className="chat-widget">
          <h3>Contacto</h3>

          {sent ? (
            <p className="chat-success">Mensaje enviado ✨</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <textarea
                placeholder="Mensaje"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />

              <button type="submit">Enviar</button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
