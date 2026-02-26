export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'threads'
  | 'youtube'
  | 'pinterest'
  | 'linkedin'
  | 'bluesky';

export interface SocialAccount {
  id: number;
  platform: Platform;
  username: string;
}

export interface PaginationMeta {
  total: number;
  offset: number;
  limit: number;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type PostStatus = 'draft' | 'scheduled' | 'processing' | 'published' | 'failed';

export interface Post {
  id: string;
  caption: string;
  scheduled_at: string | null;
  is_draft: boolean;
  status: PostStatus;
  social_accounts: number[];
  media: string[];
  platform_configurations?: PlatformConfigurations;
  account_configurations?: AccountConfiguration[];
  created_at: string;
  updated_at: string;
}

export interface InstagramConfig {
  caption?: string;
  media?: string[];
  placement?: 'feed' | 'reels';
  is_trial_reel?: boolean;
}

export interface TikTokConfig {
  caption?: string;
  media?: string[];
  title?: string;
  draft?: boolean;
  is_aigc?: boolean;
}

export interface PlatformConfigurations {
  instagram?: InstagramConfig;
  tiktok?: TikTokConfig;
  facebook?: { caption?: string; media?: string[] };
  twitter?: { caption?: string; media?: string[] };
  threads?: { caption?: string; media?: string[]; location?: string };
  youtube?: { caption?: string; media?: string[]; title?: string };
  pinterest?: { caption?: string; media?: string[]; board_ids?: string[]; link?: string; title?: string };
  linkedin?: { caption?: string; media?: string[] };
  bluesky?: { caption?: string; media?: string[] };
}

export interface AccountConfiguration {
  account_id: number;
  caption?: string;
  media?: string[];
}

export interface CreatePostDto {
  caption: string;
  social_accounts: number[];
  media?: string[];
  media_urls?: string[];
  scheduled_at?: string;
  is_draft?: boolean;
  processing_enabled?: boolean;
  platform_configurations?: PlatformConfigurations;
  account_configurations?: AccountConfiguration[];
}

export interface UpdatePostDto {
  caption?: string;
  social_accounts?: number[];
  media?: string[];
  scheduled_at?: string | null;
  is_draft?: boolean;
  platform_configurations?: PlatformConfigurations;
  account_configurations?: AccountConfiguration[];
}

export interface Media {
  id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export type MimeType = 'image/png' | 'image/jpeg' | 'video/mp4' | 'video/quicktime';

export interface CreateUploadUrlDto {
  name: string;
  mime_type: MimeType;
  size_bytes: number;
}

export interface CreateUploadUrlResponse {
  media_id: string;
  upload_url: string;
  name: string;
}

export interface DriveCategory {
  id: string;
  name: string;
  createdTime?: string;
}

export interface DriveVideo {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailLink?: string;
  createdTime?: string;
}

export interface AccountCategory {
  id: string;
  name: string;
  color: string;
  accountIds: number[];
}

export interface BulkPostItem {
  id: string;
  mediaId: string;
  mediaIds?: string[];
  name: string;
  thumbnail?: string;
  caption: string;
  accounts?: number[];
  scheduledAt?: string;
}

export interface VideoScene {
  start: number;
  end: number;
}

export interface VideoAnalysis {
  videoId: string;
  filename: string;
  duration: number;
  width: number;
  height: number;
  scenes: VideoScene[];
}

export interface VideoClip {
  id: string;
  start: number;
  end: number;
}

export interface CutClipsRequest {
  videoId: string;
  clips: VideoClip[];
}

export interface CutClipResult {
  clipId: string;
  mediaId: string;
  name: string;
}

export interface PostResult {
  id: string;
  post_id: string;
  social_account_id: number;
  platform: Platform;
  status: 'success' | 'failed';
  platform_url?: string;
  error_message?: string;
  created_at: string;
}
