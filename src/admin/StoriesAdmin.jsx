import { useEffect, useState } from 'react';
import { Eye, EyeOff, Play, Trash2 } from 'lucide-react';
import { getAllStories, setStoryVisible, deleteStory, STORIES_DAYS } from '../services/storiesService';

export default function StoriesAdmin() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStories = async () => {
    setLoading(true);
    setStories(await getAllStories());
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleToggle = async (story) => {
    await setStoryVisible(story.id, !story.visible);
    loadStories();
  };

  const handleDelete = async (story) => {
    if (!window.confirm('¿Eliminar esta historia?')) return;
    await deleteStory(story.id);
    loadStories();
  };

  const formatDate = (value) =>
    new Date(value).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const onStrip = (story) =>
    story.visible && Date.now() - new Date(story.taken_at).getTime() < STORIES_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Historias de Instagram ({stories.length})</h2>
        <p className="form-hint">
          Se capturan solas cada 3 horas. La portada muestra las de los últimos {STORIES_DAYS} días.
        </p>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">Aún no hay historias capturadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stories.map((story) => {
            const cover = story.thumbnail_url || (story.media_type === 'IMAGE' ? story.media_url : null);
            return (
              <div key={story.id} className={`item-card !p-0 ${story.visible ? '' : 'opacity-50'}`}>
                <a href={story.media_url} target="_blank" rel="noreferrer" className="relative block aspect-[9/16] bg-smoke">
                  {cover && <img src={cover} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  {story.media_type === 'VIDEO' && (
                    <span className="absolute top-2 right-2 p-1.5 bg-black/60 text-foreground">
                      <Play size={12} />
                    </span>
                  )}
                </a>
                <div className="p-3 space-y-2">
                  <div className="font-mono text-[0.65rem] text-muted-foreground">{formatDate(story.taken_at)}</div>
                  <span className={`badge ${onStrip(story) ? 'badge-active' : 'badge-inactive'}`}>
                    {!story.visible ? 'Oculta' : onStrip(story) ? 'En portada' : 'Archivada'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-small flex-1"
                      onClick={() => handleToggle(story)}
                      title={story.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {story.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small flex-1"
                      onClick={() => handleDelete(story)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
