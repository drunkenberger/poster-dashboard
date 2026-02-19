import { useTranslation } from 'react-i18next';
import type { InstagramConfig } from '../../../../shared/types/index.ts';

interface InstagramOptionsProps {
  config: InstagramConfig;
  onChange: (config: InstagramConfig) => void;
}

export default function InstagramOptions({ config, onChange }: InstagramOptionsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('platform.ig.placement')}
        </label>
        <div className="flex gap-2">
          {(['feed', 'reels'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ ...config, placement: opt })}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                (config.placement ?? 'feed') === opt
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {t(`platform.ig.${opt}`)}
            </button>
          ))}
        </div>
      </div>

      <ToggleRow
        label={t('platform.ig.trialReel')}
        description={t('platform.ig.trialReelDesc')}
        checked={config.is_trial_reel ?? false}
        onChange={(v) => onChange({ ...config, is_trial_reel: v })}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('platform.ig.captionOverride')}
        </label>
        <textarea
          value={config.caption ?? ''}
          onChange={(e) => onChange({ ...config, caption: e.target.value || undefined })}
          placeholder={t('platform.ig.captionPlaceholder')}
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
