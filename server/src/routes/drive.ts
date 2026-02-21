import { Router } from 'express';
import { listCategories, listVideos, getFileMetadata, getFileStream, getFolderInfo } from '../services/googleDrive.js';
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

router.post('/upload', async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      res.status(400).json({ error: 'fileId is required' });
      return;
    }

    const meta = await getFileMetadata(fileId);
    const mimeType = meta.mimeType === 'video/quicktime' ? 'video/quicktime' : 'video/mp4';

    const { data: uploadData } = await apiClient.post('/media/create-upload-url', {
      name: meta.name,
      mime_type: mimeType,
      size_bytes: meta.size,
    });

    const stream = await getFileStream(fileId);

    await fetch(uploadData.upload_url, {
      method: 'PUT',
      body: stream as unknown as BodyInit,
      headers: { 'Content-Type': mimeType },
      // @ts-expect-error Node fetch supports duplex for streaming
      duplex: 'half',
    });

    res.json({ media_id: uploadData.media_id, name: meta.name });
  } catch (err) {
    next(err);
  }
});

export default router;
