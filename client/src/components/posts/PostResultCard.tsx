import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import type { PostResult } from '../../../../shared/types/index.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';
import { PLATFORM_INFO } from '../../utils/platforms.ts';

interface PostResultCardProps {
  result: PostResult;
}

export default function PostResultCard({ result }: PostResultCardProps) {
  const { t } = useTranslation();
  const isSuccess = result.status === 'success';
  const platformInfo = PLATFORM_INFO[result.platform];

  return (
    <div
      id={`post-result-${result.id}`}
      className={`rounded-lg border p-4 ${
        isSuccess ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={result.platform} size={20} />
          <div>
            <p className="text-sm font-medium text-foreground">{platformInfo.label}</p>
            <p className="text-xs text-muted-foreground">
              ID: {result.social_account_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSuccess ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle size={14} />
              {t('results.success')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <XCircle size={14} />
              {t('results.failed')}
            </span>
          )}
        </div>
      </div>

      {isSuccess && result.platform_url && (
        <a
          href={result.platform_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
        >
          <ExternalLink size={14} />
          {t('results.viewOnPlatform')}
        </a>
      )}

      {!isSuccess && result.error_message && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-md bg-destructive/10">
          <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{result.error_message}</p>
        </div>
      )}
    </div>
  );
}
