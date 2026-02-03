import { useEffect, useState } from 'react';
import { getBlogPosts } from '../services/blogService';
import { getComments, createComment, getCommentsCount } from '../services/commentsService';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState({});
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getBlogPosts();
    setPosts(data);
    
    // Cargar conteo de comentarios para cada post
    const counts = {};
    for (const post of data) {
      counts[post.id] = await getCommentsCount(post.id);
    }
    setCommentsCount(counts);
  };

  const loadComments = async (postId) => {
    const data = await getComments(postId);
    setComments(data);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    loadComments(post.id);
    setNewComment({ author_name: '', author_email: '', content: '' });
    setSubmitStatus('');
  };

  const handleBackToPosts = () => {
    setSelectedPost(null);
    setComments([]);
    setNewComment({ author_name: '', author_email: '', content: '' });
    setSubmitStatus('');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.author_name || !newComment.content) {
      setSubmitStatus('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      await createComment({
        post_id: selectedPost.id,
        ...newComment
      });
      
      setSubmitStatus('¡Comentario publicado correctamente!');
      setNewComment({ author_name: '', author_email: '', content: '' });
      
      // Recargar comentarios para mostrar el nuevo
      await loadComments(selectedPost.id);
      
      // Actualizar el conteo
      const count = await getCommentsCount(selectedPost.id);
      setCommentsCount(prev => ({ ...prev, [selectedPost.id]: count }));
    } catch (error) {
      setSubmitStatus('Error al enviar el comentario. Intenta de nuevo.');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (selectedPost) {
    return (
      <section id="blog" className="blog-section">
        <div className="blog-container">
          <button className="back-button" onClick={handleBackToPosts}>
            ← Volver al Blog
          </button>
          
          <article className="blog-post-detail">
            <h1 className="post-title">{selectedPost.title}</h1>
            <div className="post-meta">
              <span className="post-author">Por {selectedPost.author}</span>
              <span className="post-date">{formatDate(selectedPost.created_at)}</span>
            </div>
            <div 
              className="post-content"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </article>

          <div className="comments-section">
            <h2>Comentarios ({comments.length})</h2>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author_name}</span>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="comment-form-wrapper">
              <h3>Deja tu comentario</h3>
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <div className="form-group">
                  <label htmlFor="author_name">Nombre *</label>
                  <input
                    type="text"
                    id="author_name"
                    value={newComment.author_name}
                    onChange={(e) => setNewComment({...newComment, author_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author_email">Email (opcional)</label>
                  <input
                    type="email"
                    id="author_email"
                    value={newComment.author_email}
                    onChange={(e) => setNewComment({...newComment, author_email: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Comentario *</label>
                  <textarea
                    id="content"
                    rows="4"
                    value={newComment.content}
                    onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="submit-button">
                  Enviar Comentario
                </button>

                {submitStatus && (
                  <div className={`submit-status ${submitStatus.includes('Error') ? 'error' : 'success'}`}>
                    {submitStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="blog-section">
      <div className="blog-container">
        <h1 className="blog-title">Blog</h1>
        
        {posts.length === 0 ? (
          <p className="no-posts">No hay publicaciones disponibles.</p>
        ) : (
          <div className="blog-posts-grid">
            {posts.map(post => (
              <article 
                key={post.id} 
                className="blog-post-card"
                onClick={() => handlePostClick(post)}
              >
                <h2 className="post-card-title">{post.title}</h2>
                <div className="post-card-meta">
                  <span className="post-card-author">Por {post.author}</span>
                  <span className="post-card-date">{formatDate(post.created_at)}</span>
                </div>
                <div 
                  className="post-card-excerpt"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.substring(0, 200) + '...' 
                  }}
                />
                <div className="post-card-footer">
                  <span className="read-more">Leer más →</span>
                  <span className="comments-count">
                    💬 {commentsCount[post.id] || 0} comentarios
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
