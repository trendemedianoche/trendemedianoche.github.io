import DOMPurify from 'dompurify';

// Barra de avisos que corre en loop (se repite 4 veces para que no quede vacía)
export default function NewsTicker({ items, className = '' }) {
  return (
    <div className={`border-t border-border/40 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="flex gap-12 text-eyebrow whitespace-nowrap animate-marquee w-max">
        {[0, 1, 2, 3].map((rep) => (
          <span key={rep} className="flex gap-12 shrink-0">
            {items.map((item, i) => (
              <span
                key={rep + '-' + i}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(`${item.icon || '★'} ${item.content || ''}`)
                }}
              />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
