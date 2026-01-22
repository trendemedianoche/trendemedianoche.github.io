import { useEffect, useState, useRef } from 'react';
import { getAbout, updateAbout } from '../services/aboutService';

export default function AboutAdmin() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      console.log('📖 AboutAdmin: Cargando contenido...');
      const data = await getAbout();
      console.log('📖 AboutAdmin: Contenido recibido:', data?.substring(0, 100));
      setContent(data);
    } catch (error) {
      console.error('📖 AboutAdmin: Error al cargar:', error);
      setMessage('❌ Error al cargar el contenido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      console.log('💾 AboutAdmin: Guardando contenido...', { length: content.length });
      await updateAbout(content);
      console.log('💾 AboutAdmin: Guardado exitoso');
      setMessage(' Contenido actualizado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('💾 AboutAdmin: Error al guardar:', error);
      setMessage('❌ Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const applyFormat = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const beforeText = content.substring(0, start);
      const afterText = content.substring(end);
      const newContent = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
      setContent(newContent);

      // Restaurar el foco y la posición del cursor
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + tag.length + 2 + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const insertTag = (openTag, closeTag = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    const newContent = `${beforeText}${openTag}${closeTag}${afterText}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title"> Editar Acerca de</h2>
      </div>

      <div className="admin-preview">
        <h3>Vista Previa</h3>
        <div 
          className="about-preview-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <form onSubmit={handleSave} className="admin-form">
        <div className="form-group">
          <label htmlFor="about-content">Contenido HTML</label>
          
          <div className="text-editor-toolbar">
            <button type="button" onClick={() => applyFormat('strong')} title="Negrita" className="toolbar-btn">
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => applyFormat('em')} title="Cursiva" className="toolbar-btn">
              <em>I</em>
            </button>
            <button type="button" onClick={() => applyFormat('s')} title="Tachado" className="toolbar-btn">
              <s>S</s>
            </button>
            <span className="toolbar-divider">|</span>
            <button type="button" onClick={() => applyFormat('h2')} title="Título 2" className="toolbar-btn">
              H2
            </button>
            <button type="button" onClick={() => applyFormat('h3')} title="Título 3" className="toolbar-btn">
              H3
            </button>
            <button type="button" onClick={() => applyFormat('p')} title="Párrafo" className="toolbar-btn">
              P
            </button>
            <span className="toolbar-divider">|</span>
            <button type="button" onClick={() => insertTag('<br>')} title="Salto de línea" className="toolbar-btn">
              BR
            </button>
            <button type="button" onClick={() => insertTag('<small>', '</small>')} title="Texto pequeño" className="toolbar-btn">
              <small>small</small>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            id="about-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="admin-textarea"
            placeholder="Escribe el contenido en HTML..."
          />
          <small className="form-hint">
            Selecciona texto y usa la barra de herramientas para aplicar formato HTML
          </small>
        </div>

        {message && (
          <div className={`admin-message ${message.includes('') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="admin-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadContent}
            disabled={saving}
          >
            🔄 Recargar
          </button>
        </div>
      </form>
    </div>
  );
}
