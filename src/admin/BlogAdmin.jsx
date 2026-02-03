import { useState, useEffect, useRef } from 'react';
import { 
  getAllBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  togglePublishPost 
} from '../services/blogService';
import { 
  getAllComments, 
  getPendingComments,
  approveComment, 
  deleteComment 
} from '../services/commentsService';

export default function BlogAdmin() {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    published: false
  });
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    loadPosts();
    loadComments();
    loadPendingComments();
  }, []);

  const loadPosts = async () => {
    const data = await getAllBlogPosts();
    setPosts(data);
  };

  const loadComments = async () => {
    const data = await getAllComments();
    setComments(data);
  };

  const loadPendingComments = async () => {
    const data = await getPendingComments();
    setPendingComments(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPost) {
        await updateBlogPost(editingPost.id, formData);
        setMessage('✅ Post actualizado correctamente');
      } else {
        await createBlogPost(formData);
        setMessage('✅ Post creado correctamente');
      }
      
      setFormData({ title: '', content: '', author: '', published: false });
      setEditingPost(null);
      loadPosts();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al guardar el post');
      console.error(error);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      author: post.author,
      published: post.published
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este post?')) return;
    
    try {
      await deleteBlogPost(id);
      setMessage('✅ Post eliminado');
      loadPosts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar el post');
      console.error(error);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await togglePublishPost(id, !currentStatus);
      setMessage(`✅ Post ${!currentStatus ? 'publicado' : 'despublicado'}`);
      loadPosts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al cambiar estado');
      console.error(error);
    }
  };

  const handleApproveComment = async (id) => {
    try {
      await approveComment(id);
      setMessage('✅ Comentario aprobado');
      loadComments();
      loadPendingComments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al aprobar comentario');
      console.error(error);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    
    try {
      await deleteComment(id);
      setMessage('✅ Comentario eliminado');
      loadComments();
      loadPendingComments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar comentario');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const applyFormat = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    if (selectedText) {
      const beforeText = formData.content.substring(0, start);
      const afterText = formData.content.substring(end);
      const newContent = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
      setFormData({...formData, content: newContent});

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
    const beforeText = formData.content.substring(0, start);
    const afterText = formData.content.substring(end);
    const newContent = `${beforeText}${openTag}${closeTag}${afterText}`;
    setFormData({...formData, content: newContent});

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="blog-admin">
      <h2>Gestión del Blog</h2>
      
      {message && (
        <div className={`admin-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({posts.length})
        </button>
        <button 
          className={activeTab === 'comments' ? 'active' : ''}
          onClick={() => setActiveTab('comments')}
        >
          Comentarios ({comments.length})
        </button>
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pendientes ({pendingComments.length})
        </button>
      </div>

      {activeTab === 'posts' && (
        <div className="posts-tab">
          <div className="post-form-section">
            <h3>{editingPost ? 'Editar Post' : 'Nuevo Post'}</h3>
            
            {formData.content && (
              <div className="admin-preview">
                <h4>Vista Previa</h4>
                <div 
                  className="blog-preview-content"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="post-form">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Autor</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contenido (HTML)</label>
                
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
                  <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} title="Lista" className="toolbar-btn">
                    UL
                  </button>
                  <button type="button" onClick={() => insertTag('<br>')} title="Salto de línea" className="toolbar-btn">
                    BR
                  </button>
                  <button type="button" onClick={() => insertTag('<small>', '</small>')} title="Texto pequeño" className="toolbar-btn">
                    <small>small</small>
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="15"
                  required
                  placeholder="Escribe el contenido en HTML..."
                />
                <small className="form-hint">
                  Usa HTML para formatear el contenido. Selecciona texto y usa los botones para aplicar formato.
                </small>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({...formData, published: e.target.checked})}
                  />
                  Publicar inmediatamente
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingPost ? 'Actualizar' : 'Crear'} Post
                </button>
                {editingPost && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setEditingPost(null);
                      setFormData({ title: '', content: '', author: '', published: false });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="posts-list-section">
            <h3>Todos los Posts</h3>
            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-item">
                  <div className="post-item-header">
                    <h4>{post.title}</h4>
                    <span className={`status-badge ${post.published ? 'published' : 'draft'}`}>
                      {post.published ? '✓ Publicado' : '○ Borrador'}
                    </span>
                  </div>
                  <div className="post-item-meta">
                    <span>Por {post.author}</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="post-item-actions">
                    <button onClick={() => handleEdit(post)} className="btn-edit">
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleTogglePublish(post.id, post.published)}
                      className="btn-toggle"
                    >
                      {post.published ? '👁️ Despublicar' : '✓ Publicar'}
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="btn-delete">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="pending-tab">
          <h3>Comentarios Pendientes de Aprobación</h3>
          {pendingComments.length === 0 ? (
            <p className="no-items">No hay comentarios pendientes</p>
          ) : (
            <div className="comments-list">
              {pendingComments.map(comment => (
                <div key={comment.id} className="comment-item pending">
                  <div className="comment-header">
                    <strong>{comment.author_name}</strong>
                    {comment.author_email && <span>({comment.author_email})</span>}
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                  <div className="comment-post-title">
                    En el post: <em>{comment.blog_posts?.title}</em>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  <div className="comment-actions">
                    <button 
                      onClick={() => handleApproveComment(comment.id)}
                      className="btn-approve"
                    >
                      ✓ Aprobar
                    </button>
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn-reject"
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="comments-tab">
          <h3>Todos los Comentarios</h3>
          {comments.length === 0 ? (
            <p className="no-items">No hay comentarios</p>
          ) : (
            <div className="comments-list">
              {comments.map(comment => (
                <div 
                  key={comment.id} 
                  className={`comment-item ${comment.approved ? 'approved' : 'pending'}`}
                >
                  <div className="comment-header">
                    <strong>{comment.author_name}</strong>
                    {comment.author_email && <span>({comment.author_email})</span>}
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                    <span className={`status-badge ${comment.approved ? 'approved' : 'pending'}`}>
                      {comment.approved ? '✓ Aprobado' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <div className="comment-post-title">
                    En el post: <em>{comment.blog_posts?.title}</em>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  <div className="comment-actions">
                    {!comment.approved && (
                      <button 
                        onClick={() => handleApproveComment(comment.id)}
                        className="btn-approve"
                      >
                        ✓ Aprobar
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn-delete"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
