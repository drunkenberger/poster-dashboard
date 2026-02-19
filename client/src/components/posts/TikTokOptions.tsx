import { useTranslation } from 'react-i18next';
import type { TikTokConfig } from '../../../../shared/types/index.ts';

interface TikTokOptionsProps {
  config: TikTokConfig;
  onChange: (config: TikTokConfig) => void;
}

export default function TikTokOptions({ config, onChange }: TikTokOptionsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('platform.tt.title')}
        </label>
        <input
          type="text"
          value={config.title ?? ''}
          onChange={(e) => onChange({ ...config, title: e.target.value || undefined })}
          placeholder={t('platform.tt.titlePlaceholder')}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ToggleRow
        label={t('platform.tt.aigc')}
        description={t('platform.tt.aigcDesc')}
        checked={config.is_aigc ?? false}
        onChange={(v) => onChange({ ...config, is_aigc: v })}
      />

      <ToggleRow
        label={t('platform.tt.draft')}
        description={t('platform.tt.draftDesc')}
        checked={config.draft ?? false}
        onChange={(v) => onChange({ ...config, draft: v })}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('platform.tt.captionOverride')}
        </label>
        <textarea
          value={config.caption ?? ''}
          onChange={(e) => onChange({ ...config, caption: e.target.value || undefined })}
          placeholder={t('platform.tt.captionPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="pt-0.5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            checked ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}
