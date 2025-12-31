import { useEffect, useState } from 'react';
import {
  getChatMessages,
  markChatAsRead,
  deleteChatMessage
} from '../services/chatService';
import '../styles/ChatAdmin.css';


export default function ChatAdmin() {
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    const data = await getChatMessages();
    setMessages(data);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="chat-admin">
      <h2>Mensajes recibidos</h2>

      {messages.length === 0 && <p>No hay mensajes</p>}

      {messages.map(msg => (
        <div
          key={msg.id}
          className={`chat-card ${msg.read ? 'read' : ''}`}
        >
          <strong>{msg.name}</strong>
          <span>{msg.email}</span>
          <p>{msg.message}</p>

          <div className="chat-actions">
            {!msg.read && (
              <button
                onClick={() => {
                  markChatAsRead(msg.id);
                  loadMessages();
                }}
              >
                ✔ Marcar leído
              </button>
            )}

            <button
              className="danger"
              onClick={() => {
                if (confirm('¿Eliminar mensaje?')) {
                  deleteChatMessage(msg.id);
                  loadMessages();
                }
              }}
            >
              🗑 Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
