import { useTranslation } from 'react-i18next';
import type { PostStatus } from '../../../../shared/types/index.ts';

const STATUSES: PostStatus[] = ['draft', 'scheduled', 'processing', 'published', 'failed'];

interface StatusFilterProps {
  selected: PostStatus | null;
  onChange: (status: PostStatus | null) => void;
}

export default function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const { t } = useTranslation();

  return (
    <div id="posts-status-filter-014" className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-accent'
        }`}
      >
        {t('common.all')}
      </button>

      {STATUSES.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status === selected ? null : status)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === status
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {t(`posts.status.${status}`)}
        </button>
      ))}
    </div>
  );
}
