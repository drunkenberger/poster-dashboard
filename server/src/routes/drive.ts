import { Router } from 'express';
import {
  listCategories, listVideos, listImages, findCarouselFolders,
  getFileMetadata, getFileStream, getFolderInfo, readTextFileFromFolder,
} from '../services/googleDrive.js';
import apiClient from '../utils/apiClient.js';

const router = Router();

router.get('/categories', async (_req, res, next) => {
  try {
    res.json(await listCategories());
  } catch (err) {
    next(err);
  }
});

router.get('/categories/:id/videos', async (req, res, next) => {
  try {
    const videos = await listVideos(req.params.id);
    res.json(videos);
  } catch (err) {
    next(err);
  }
});

router.get('/folder-info/:folderId', async (req, res, next) => {
  try {
    res.json(await getFolderInfo(req.params.folderId));
  } catch {
    res.status(400).json({ error: 'Invalid folder ID or not a folder' });
  }
});

router.get('/:folderId/subfolders', async (req, res, next) => {
  try {
    res.json(await listCategories(req.params.folderId));
  } catch (err) {
    next(err);
  }
});

router.get('/:folderId/carousel-folders', async (req, res, next) => {
  try {
    res.json(await findCarouselFolders(req.params.folderId));
  } catch (err) {
    next(err);
  }
});

router.get('/:folderId/images', async (req, res, next) => {
  try {
    res.json(await listImages(req.params.folderId));
  } catch (err) {
    next(err);
  }
});

router.get('/:folderId/caption', async (req, res, next) => {
  try {
    const text = await readTextFileFromFolder(req.params.folderId, 'caption.txt');
    res.json({ caption: text ?? '' });
  } catch (err) {
    next(err);
  }
});

const SUPPORTED_MIMES: Record<string, string> = {
  'video/mp4': 'video/mp4',
  'video/quicktime': 'video/quicktime',
  'video/x-matroska': 'video/mp4',
  'video/webm': 'video/mp4',
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/webp': 'image/webp',
};

router.post('/upload', async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      res.status(400).json({ error: 'fileId is required' });
      return;
    }

    const meta = await getFileMetadata(fileId);
    const mimeType = SUPPORTED_MIMES[meta.mimeType] ?? 'video/mp4';

    const { data: uploadData } = await apiClient.post('/media/create-upload-url', {
      name: meta.name,
      mime_type: mimeType,
      size_bytes: meta.size,
    });

    const stream = await getFileStream(fileId);

    const uploadRes = await fetch(uploadData.upload_url, {
      method: 'PUT',
      body: stream as unknown as BodyInit,
      headers: { 'Content-Type': mimeType },
      // @ts-expect-error Node fetch supports duplex for streaming
      duplex: 'half',
    });

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text().catch(() => '');
      console.error(`[Drive Upload] PUT to upload_url failed: ${uploadRes.status} — ${errBody}`);
      res.status(502).json({ error: `Media upload failed: ${uploadRes.status}`, details: errBody });
      return;
    }

    res.json({ media_id: uploadData.media_id, name: meta.name });
  } catch (err) {
    next(err);
  }
});

export default router;
