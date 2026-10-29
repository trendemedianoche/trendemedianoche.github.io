import { useEffect, useState } from 'react';
import {
  getChatMessages,
  markChatAsRead,
  deleteChatMessage
} from '../services/chatService';


export default function ChatAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getChatMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    await markChatAsRead(id);
    loadMessages();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este mensaje?')) {
      await deleteChatMessage(id);
      loadMessages();
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Bandeja de entrada</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p className="empty-state-text">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p className="empty-state-text">No hay mensajes</p>
          </div>
        ) : (
          <div className="admin-card-body">
            {messages.map(msg => (
              <div key={msg.id} className="message-item">
                <div className="message-header">
                  <strong>{msg.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                    {msg.email}
                  </span>
                </div>
                <p style={{ margin: '0.8rem 0', lineHeight: '1.6' }}>
                  {msg.message}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!msg.read && (
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleMarkAsRead(msg.id)}
                    >
                      Marcar leído
                    </button>
                  )}
                  {msg.read && (
                    <span className="badge badge-active">Leído</span>
                  )}
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(msg.id)}
                  >
                    Eliminar
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
