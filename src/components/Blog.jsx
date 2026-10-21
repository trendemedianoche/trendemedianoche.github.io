import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
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

  // Columnas de la grilla según el ancho (igual que md:grid-cols-2 / lg:grid-cols-3)
  const getColumns = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    const onResize = () => setColumns(getColumns());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getBlogPosts();
    setPosts(data);
    const counts = {};
    for (const post of data) {
      counts[post.id] = await getCommentsCount(post.id);
    }
    setCommentsCount(counts);
  };

  const loadComments = async (postId) => {
    setComments(await getComments(postId));
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    loadComments(post.id);
    setNewComment({ author_name: '', author_email: '', content: '' });
    setSubmitStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setSubmitStatus('Por favor completa los campos obligatorios');
      return;
    }
    try {
      await createComment({ post_id: selectedPost.id, ...newComment });
      setSubmitStatus('¡Comentario publicado correctamente!');
      setNewComment({ author_name: '', author_email: '', content: '' });
      await loadComments(selectedPost.id);
      const count = await getCommentsCount(selectedPost.id);
      setCommentsCount((prev) => ({ ...prev, [selectedPost.id]: count }));
    } catch (error) {
      setSubmitStatus('Error al enviar el comentario. Intenta de nuevo.');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Texto plano del contenido, sin repetir el título al comienzo
  const getExcerpt = (post) => {
    const text = (new DOMParser().parseFromString(post.content, 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    return !post.title.endsWith('…') && text.startsWith(post.title)
      ? text.slice(post.title.length).trim()
      : text;
  };

  const isImageSlot = (slot) => slot.length === 1 && Boolean(slot[0].cover_image);
  const chunk = (list, size) =>
    Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));
  const gridCls = 'grid md:grid-cols-2 lg:grid-cols-3 gap-6';

  // Agrupa las entradas: las con imagen van solas y las de solo texto de a dos
  const groupPosts = (list) => {
    const slots = [];
    let openStack = null;
    for (const post of list) {
      if (post.cover_image) {
        slots.push([post]);
      } else if (openStack && openStack.length < 2) {
        openStack.push(post);
      } else {
        openStack = [post];
        slots.push(openStack);
      }
    }
    return slots;
  };

  const renderCard = (post) => {
    const excerpt = getExcerpt(post);
    return (
      <article
        key={post.id}
        onClick={() => handlePostClick(post)}
        className={`group cursor-pointer border border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col overflow-hidden ${
          post.cover_image ? 'h-[28.5rem]' : 'h-[13.5rem] shrink-0'
        }`}
      >
        {post.cover_image && (
          <div className="h-48 shrink-0 overflow-hidden">
            <img
              src={post.cover_image}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div className="flex-1 min-h-0 flex flex-col p-6">
          <div className="font-mono text-xs text-primary mb-2">
            {formatDate(post.created_at)}
            {post.source && (
              <span className="text-muted-foreground">
                {' · '}
                {post.source === 'instagram' ? 'Instagram' : 'Facebook'}
              </span>
            )}
          </div>
          <h2 className="text-display text-xl md:text-2xl leading-tight line-clamp-2 mb-2">
            {post.title}
          </h2>
          {excerpt && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{excerpt}</p>
          )}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="text-eyebrow text-primary inline-flex items-center gap-1">
              Leer más <ArrowUpRight size={14} />
            </span>
            <span className="font-mono text-xs text-muted-foreground inline-flex items-center gap-1">
              <MessageCircle size={13} /> {commentsCount[post.id] || 0}
            </span>
          </div>
        </div>
      </article>
    );
  };

  const inputCls =
    'w-full bg-transparent border border-border/70 focus:border-primary outline-none px-4 py-3 font-mono text-sm transition';

  /* ----------------------------- DETALLE ----------------------------- */
  if (selectedPost) {
    return (
      <section className="relative py-28 md:py-36">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <button
            onClick={handleBackToPosts}
            className="text-eyebrow text-primary hover:underline mb-10 inline-flex items-center gap-2"
          >
            ← Volver al blog
          </button>

          <article>
            <div className="text-eyebrow mb-4">
              {selectedPost.author} · {formatDate(selectedPost.created_at)}
            </div>
            <h1 className="text-display text-4xl md:text-6xl leading-[1.05] mb-8">
              {selectedPost.title}
            </h1>
            <div
              className="text-muted-foreground leading-relaxed [&_p]:mb-4 [&_a]:text-primary [&_img]:w-full [&_img]:h-auto [&_h2]:text-foreground [&_h2]:text-display [&_h2]:text-3xl [&_h2]:mt-8 [&_h2]:mb-3"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPost.content) }}
            />
          </article>

          <div className="mt-16 border-t border-border/40 pt-12">
            <h2 className="text-display text-3xl mb-8">Comentarios ({comments.length})</h2>

            <div className="space-y-4 mb-12">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-border/60 p-5">
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                      <span className="text-foreground font-medium">{comment.author_name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="border border-border/60 p-6 md:p-8 bg-background/40">
              <h3 className="text-eyebrow mb-6">Deja tu comentario</h3>
              <form className="grid gap-4" onSubmit={handleCommentSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-eyebrow block mb-2">Nombre *</span>
                    <input
                      className={inputCls}
                      value={newComment.author_name}
                      onChange={(e) => setNewComment({ ...newComment, author_name: e.target.value })}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-eyebrow block mb-2">Email (opcional)</span>
                    <input
                      type="email"
                      className={inputCls}
                      value={newComment.author_email}
                      onChange={(e) =>
                        setNewComment({ ...newComment, author_email: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-eyebrow block mb-2">Comentario *</span>
                  <textarea
                    rows={4}
                    className={`${inputCls} resize-none`}
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    required
                  />
                </label>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {submitStatus && (
                    <span
                      className={`font-mono text-xs ${
                        submitStatus.includes('Error') || submitStatus.includes('Por favor')
                          ? 'text-accent'
                          : 'text-primary'
                      }`}
                    >
                      {submitStatus}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-8 py-4 bg-ember-gradient text-primary-foreground text-eyebrow shadow-ember hover:scale-[1.02] transition-transform"
                  >
                    Enviar comentario →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ----------------------------- LISTA ----------------------------- */
  return (
    <section className="relative py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="mb-14">
          <div className="text-eyebrow mb-4">Bitácora</div>
          <h1 className="text-display text-5xl md:text-7xl">
            Notas desde <span className="italic text-primary">el vagón.</span>
          </h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No hay publicaciones disponibles.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {chunk(groupPosts(posts), columns).map((row) =>
              row.some(isImageSlot) ? (
                <div key={row[0][0].id} className={gridCls}>
                  {row.map((slot) =>
                    isImageSlot(slot) ? (
                      renderCard(slot[0])
                    ) : (
                      // Junto a una con imagen, dos de solo texto se apilan en su mismo alto
                      <div key={slot[0].id} className="h-[28.5rem] flex flex-col gap-6">
                        {slot.map(renderCard)}
                      </div>
                    )
                  )}
                </div>
              ) : (
                // Fila sin imágenes: las de solo texto van una al lado de la otra
                <div key={row[0][0].id} className={gridCls}>
                  {row.flat().map(renderCard)}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
