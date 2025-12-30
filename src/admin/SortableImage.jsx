import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableImage({ image, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`image-card ${!image.active ? 'inactive' : ''}`}
      {...attributes}
      {...listeners}
      onClick={onSelect}
    >
      <img src={image.url} alt={image.alt} />
    </div>
  );
}
