import { useEffect, useState } from 'react';
import {
  getSocialNetworksAdmin,
  updateSocialNetwork,
  toggleSocialNetworkActive,
  reorderSocialNetworks
} from '../services/donationService';
import '../styles/AdminComponents.css';

export default function FooterAdmin() {
  const [contactData, setContactData] = useState([]);
  const [socialNetworks, setSocialNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para datos de contacto
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Estados para redes sociales
  const [editingSocialId, setEditingSocialId] = useState(null);
  const [editSocialValue, setEditSocialValue] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    
    const allData = await getSocialNetworksAdmin();
    
    // Separar datos de contacto (email, phone) de redes sociales
    const contact = allData.filter(item => ['email', 'phone'].includes(item.type));
    const socials = allData.filter(item => item.type === 'social');
    
    setContactData(contact);
    setSocialNetworks(socials);
    
    setLoading(false);
  };

  // Contact data functions
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.url);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const updateValue = async (id, value) => {
    setLoading(true);
    await updateSocialNetwork(id, { url: value });
    setEditingId(null);
    setEditValue('');
    load();
  };

  const toggleActive = async (item) => {
    setLoading(true);
    await toggleSocialNetworkActive(item.id, !item.active);
    load();
  };

  const moveContact = async (index, dir) => {
    const updated = [...contactData];
    const target = index + dir;
    if (target < 0 || target >= updated.length) return;

    [updated[index], updated[target]] = [updated[target], updated[index]];

    setLoading(true);
    setContactData(updated);
    await reorderSocialNetworks(updated);
    load();
  };

  // Social Networks functions
  const startSocialEdit = (social) => {
    setEditingSocialId(social.id);
    setEditSocialValue(social.url);
  };

  const cancelSocialEdit = () => {
    setEditingSocialId(null);
    setEditSocialValue('');
  };

  const updateSocial = async (id, value) => {
    setLoading(true);
    await updateSocialNetwork(id, { url: value });
    setEditingSocialId(null);
    setEditSocialValue('');
    load();
  };

  const toggleSocialActive = async (social) => {
    setLoading(true);
    await toggleSocialNetworkActive(social.id, !social.active);
    load();
  };

  const moveSocial = async (index, dir) => {
    const updated = [...socialNetworks];
    const target = index + dir;
    if (target < 0 || target >= updated.length) return;

    [updated[index], updated[target]] = [updated[target], updated[index]];

    setLoading(true);
    setSocialNetworks(updated);
    await reorderSocialNetworks(updated);
    load();
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">⚙️ Configuración del Footer</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p className="empty-state-text">Cargando...</p>
        </div>
      ) : (
        <div className="admin-card-body">
          
          {/* SECCIÓN DATOS DE CONTACTO */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#f5c400', 
              fontSize: '1.1rem', 
              marginBottom: '1rem',
              borderBottom: '1px solid #333',
              paddingBottom: '0.5rem'
            }}>
              📧 Datos de Contacto ({contactData.length})
            </h3>
            
            {contactData.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem' }}>No hay datos de contacto configurados</p>
            ) : (
              contactData.map((item, i) => (
                <div key={item.id} className="item-card" style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5c400', fontSize: '0.9rem' }}>
                      {item.name}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingId === item.id ? editValue : item.url}
                        onChange={e => setEditValue(e.target.value)}
                        disabled={editingId !== item.id}
                        placeholder={item.type === 'email' ? 'correo@ejemplo.com' : '56912345678'}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          border: '1px solid #333',
                          background: editingId === item.id ? '#1a1a1a' : '#0d0d0d',
                          color: '#f5f5f5',
                          borderRadius: '4px',
                          fontSize: '0.95rem',
                          opacity: editingId === item.id ? 1 : 0.7
                        }}
                      />
                      {editingId === item.id ? (
                        <>
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => updateValue(item.id, editValue)}
                            disabled={loading}
                            title="Guardar"
                          >
                            💾
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={cancelEdit}
                            disabled={loading}
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => startEdit(item)}
                          disabled={loading || editingId !== null}
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => moveContact(i, -1)}
                      disabled={loading || i === 0}
                      title="Mover arriba"
                    >
                      ⬆
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => moveContact(i, 1)}
                      disabled={loading || i === contactData.length - 1}
                      title="Mover abajo"
                    >
                      ⬇
                    </button>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => toggleActive(item)}
                      disabled={loading}
                      title={item.active ? 'Visible en footer' : 'Oculto en footer'}
                    >
                      {item.active ? '👁' : '🔒'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SECCIÓN REDES SOCIALES */}
          <div>
            <h3 style={{ 
              color: '#f5c400', 
              fontSize: '1.1rem', 
              marginBottom: '1rem',
              borderBottom: '1px solid #333',
              paddingBottom: '0.5rem'
            }}>
              🌐 Redes Sociales ({socialNetworks.length})
            </h3>
            
            {socialNetworks.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem' }}>No hay redes sociales configuradas</p>
            ) : (
              socialNetworks.map((social, i) => (
                <div key={social.id} className="item-card" style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5c400', fontSize: '0.9rem' }}>
                      {social.name}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingSocialId === social.id ? editSocialValue : social.url}
                        onChange={e => setEditSocialValue(e.target.value)}
                        disabled={editingSocialId !== social.id}
                        placeholder="https://..."
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          border: '1px solid #333',
                          background: editingSocialId === social.id ? '#1a1a1a' : '#0d0d0d',
                          color: '#f5f5f5',
                          borderRadius: '4px',
                          fontSize: '0.95rem',
                          opacity: editingSocialId === social.id ? 1 : 0.7
                        }}
                      />
                      {editingSocialId === social.id ? (
                        <>
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => updateSocial(social.id, editSocialValue)}
                            disabled={loading}
                            title="Guardar"
                          >
                            💾
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={cancelSocialEdit}
                            disabled={loading}
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => startSocialEdit(social)}
                          disabled={loading || editingSocialId !== null}
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => moveSocial(i, -1)}
                      disabled={loading || i === 0}
                      title="Mover arriba"
                    >
                      ⬆
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => moveSocial(i, 1)}
                      disabled={loading || i === socialNetworks.length - 1}
                      title="Mover abajo"
                    >
                      ⬇
                    </button>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => toggleSocialActive(social)}
                      disabled={loading}
                      title={social.active ? 'Activa' : 'Inactiva'}
                    >
                      {social.active ? '👁' : '🔒'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
