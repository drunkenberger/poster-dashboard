import type { BulkCarousel } from '../../stores/bulkCarouselStore.ts';

interface CarouselTabsProps {
  carousels: BulkCarousel[];
  activeIndex: number;
  onChange: (ci: number) => void;
}

export default function CarouselTabs({ carousels, activeIndex, onChange }: CarouselTabsProps) {
  return (
    <div id="series-carousel-tabs-076" className="flex gap-1 overflow-x-auto pb-1">
      {carousels.map((c) => (
        <button
          key={c.carouselIndex}
          onClick={() => onChange(c.carouselIndex)}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            c.carouselIndex === activeIndex
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          #{c.carouselIndex} — {c.subject.slice(0, 25)}{c.subject.length > 25 ? '…' : ''}
        </button>
      ))}
    </div>
  );
}
