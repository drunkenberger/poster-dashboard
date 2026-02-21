import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'stream';

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
const PUBLIC_API_KEY = 'AIzaSyC1qbk75NzWBvSaDh6KnsjjA9pIrP4lYIE';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_REFERER = 'https://drive.google.com/';

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

function publicFetch(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, key: PUBLIC_API_KEY });
  return fetch(`${DRIVE_API_BASE}${path}?${qs}`, {
    headers: { Referer: DRIVE_REFERER },
  });
}

type PublicFile = {
  id: string; name: string; mimeType?: string;
  size?: string; thumbnailLink?: string; createdTime?: string;
};

async function publicList(query: string, fields: string) {
  const allFiles: PublicFile[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      q: query,
      fields: `nextPageToken,files(${fields})`,
      pageSize: '1000',
    };
    if (pageToken) params.pageToken = pageToken;
    const res = await publicFetch('', params);
    const data = await res.json() as { files?: PublicFile[]; nextPageToken?: string; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);
    allFiles.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allFiles;
}

function driveThumbnail(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w320`;
}

export async function listCategories(parentId?: string) {
  const folderId = parentId ?? process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not configured');

  try {
    const files = await publicList(
      `'${folderId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`,
      'id,name,createdTime',
    );
    return files.map((f) => ({ id: f.id, name: f.name, createdTime: f.createdTime }));
  } catch {
    const res = await getDrive().files.list({
      q: `'${folderId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`,
      fields: 'files(id,name,createdTime)',
      orderBy: 'name',
      pageSize: 100,
    });
    return (res.data.files ?? []).map((f) => ({
      id: f.id!, name: f.name!, createdTime: f.createdTime ?? undefined,
    }));
  }
}

export async function listVideos(folderId: string) {
  const mimeQuery = VIDEO_MIMES.map((m) => `mimeType='${m}'`).join(' or ');

  try {
    const files = await publicList(
      `'${folderId}' in parents and (${mimeQuery}) and trashed=false`,
      'id,name,mimeType,size,createdTime',
    );
    return files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType ?? 'video/mp4',
      size: Number(f.size ?? 0),
      thumbnailLink: driveThumbnail(f.id),
      createdTime: f.createdTime,
    }));
  } catch {
    const allFiles: drive_v3.Schema$File[] = [];
    let pageToken: string | undefined;
    do {
      const res = await getDrive().files.list({
        q: `'${folderId}' in parents and (${mimeQuery}) and trashed=false`,
        fields: 'nextPageToken,files(id,name,mimeType,size,thumbnailLink,createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 1000,
        pageToken,
      });
      allFiles.push(...(res.data.files ?? []));
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    return allFiles.map((f) => ({
      id: f.id!, name: f.name!, mimeType: f.mimeType!,
      size: Number(f.size ?? 0),
      thumbnailLink: f.thumbnailLink ?? driveThumbnail(f.id!),
      createdTime: f.createdTime ?? undefined,
    }));
  }
}

export async function getFolderInfo(folderId: string) {
  try {
    const res = await publicFetch(`/${folderId}`, { fields: 'id,name,mimeType' });
    const data = await res.json() as { id: string; name: string; mimeType: string; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);
    if (data.mimeType !== FOLDER_MIME) throw new Error('Not a folder');
    return { id: data.id, name: data.name };
  } catch {
    const res = await getDrive().files.get({ fileId: folderId, fields: 'id,name,mimeType' });
    if (res.data.mimeType !== FOLDER_MIME) throw new Error('Not a folder');
    return { id: res.data.id!, name: res.data.name! };
  }
}

export async function getFileMetadata(fileId: string) {
  try {
    const res = await publicFetch(`/${fileId}`, { fields: 'id,name,mimeType,size' });
    const data = await res.json() as { id: string; name: string; mimeType: string; size: string; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);
    return {
      id: data.id, name: data.name, mimeType: data.mimeType,
      size: Number(data.size ?? 0),
    };
  } catch {
    const res = await getDrive().files.get({ fileId, fields: 'id,name,mimeType,size' });
    return {
      id: res.data.id!, name: res.data.name!, mimeType: res.data.mimeType!,
      size: Number(res.data.size ?? 0),
    };
  }
}

export async function getFileStream(fileId: string): Promise<Readable> {
  try {
    const res = await publicFetch(`/${fileId}`, { alt: 'media' });
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');
    return new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) { this.push(null); return; }
        this.push(Buffer.from(value));
      },
    });
  } catch {
    const res = await getDrive().files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
    );
    return res.data as Readable;
  }
}
