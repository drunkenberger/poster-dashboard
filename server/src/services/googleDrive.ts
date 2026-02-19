import { google, type drive_v3 } from 'googleapis';
import type { Readable } from 'stream';

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  driveClient = google.drive({ version: 'v3', auth: oauth2 });
  return driveClient;
}

export async function listCategories(parentId?: string) {
  const folderId = parentId ?? process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not configured');

  const res = await getDrive().files.list({
    q: `'${folderId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`,
    fields: 'files(id,name,createdTime)',
    orderBy: 'name',
    pageSize: 100,
  });

  return (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    createdTime: f.createdTime ?? undefined,
  }));
}

export async function listVideos(folderId: string) {
  const mimeQuery = VIDEO_MIMES.map((m) => `mimeType='${m}'`).join(' or ');
  const res = await getDrive().files.list({
    q: `'${folderId}' in parents and (${mimeQuery}) and trashed=false`,
    fields: 'files(id,name,mimeType,size,thumbnailLink,createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  return (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType!,
    size: Number(f.size ?? 0),
    thumbnailLink: f.thumbnailLink ?? undefined,
    createdTime: f.createdTime ?? undefined,
  }));
}

export async function getFolderInfo(folderId: string) {
  const res = await getDrive().files.get({
    fileId: folderId,
    fields: 'id,name,mimeType',
  });
  if (res.data.mimeType !== FOLDER_MIME) {
    throw new Error('Not a folder');
  }
  return { id: res.data.id!, name: res.data.name! };
}

export async function getFileMetadata(fileId: string) {
  const res = await getDrive().files.get({
    fileId,
    fields: 'id,name,mimeType,size',
  });
  return {
    id: res.data.id!,
    name: res.data.name!,
    mimeType: res.data.mimeType!,
    size: Number(res.data.size ?? 0),
  };
}

export async function getFileStream(fileId: string): Promise<Readable> {
  const res = await getDrive().files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' },
  );
  return res.data as Readable;
}
