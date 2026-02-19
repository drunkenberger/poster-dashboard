import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { createReadStream, createWriteStream, statSync } from 'fs';
import { mkdir, rm, rename } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { analyzeVideo, mergeIntoClips, cutClip } from '../services/videoProcessor.js';
import { getFileMetadata, getFileStream } from '../services/googleDrive.js';
import { generateCaptions } from '../services/captions.js';
import apiClient from '../utils/apiClient.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = resolve(__dirname, '../../temp/videos');

const upload = multer({
  dest: resolve(TEMP_DIR, '_uploads'),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('video/'));
  },
});

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

function sourcePath(videoId: string) {
  return resolve(TEMP_DIR, videoId, 'source.mp4');
}

async function uploadClipToPostBridge(clipPath: string, clipName: string) {
  const clipStat = statSync(clipPath);
  const { data: uploadData } = await apiClient.post('/media/create-upload-url', {
    name: clipName,
    mime_type: 'video/mp4',
    size_bytes: clipStat.size,
  });

  const clipStream = createReadStream(clipPath);
  await fetch(uploadData.upload_url, {
    method: 'PUT',
    body: clipStream as unknown as BodyInit,
    headers: { 'Content-Type': 'video/mp4' },
    // @ts-expect-error Node fetch supports duplex for streaming
    duplex: 'half',
  });

  return { mediaId: uploadData.media_id as string, name: clipName };
}

const router = Router();

router.post('/upload', upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const videoId = randomUUID();
    const videoDir = resolve(TEMP_DIR, videoId);
    await ensureDir(videoDir);

    const dest = sourcePath(videoId);
    await rename(req.file.path, dest);

    const analysis = await analyzeVideo(dest, videoId, req.file.originalname);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

router.post('/from-drive', async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      res.status(400).json({ error: 'fileId is required' });
      return;
    }

    const meta = await getFileMetadata(fileId);
    const videoId = randomUUID();
    const videoDir = resolve(TEMP_DIR, videoId);
    await ensureDir(videoDir);

    const dest = sourcePath(videoId);
    const stream = await getFileStream(fileId);
    await pipeline(stream, createWriteStream(dest));

    const analysis = await analyzeVideo(dest, videoId, meta.name);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

router.get('/:videoId/stream', (req, res) => {
  const filePath = sourcePath(req.params.videoId);

  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  const { size } = stat;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    });
    createReadStream(filePath).pipe(res);
  }
});

router.post('/auto-cut', async (req, res, next) => {
  try {
    const { videoId, clipDuration } = req.body;
    if (!videoId) {
      res.status(400).json({ error: 'videoId is required' });
      return;
    }

    const input = sourcePath(videoId);
    const videoDir = resolve(TEMP_DIR, videoId);
    const analysis = await analyzeVideo(input, videoId, 'source.mp4');
    const clips = mergeIntoClips(analysis.scenes, clipDuration ?? 30);

    const results = [];
    const clipNames: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const clipPath = resolve(videoDir, `clip-${clip.id}.mp4`);
      await cutClip(input, clip.start, clip.duration, clipPath);

      const clipName = `clip-${String(i + 1).padStart(2, '0')}.mp4`;
      const { mediaId, name } = await uploadClipToPostBridge(clipPath, clipName);
      clipNames.push(name);

      results.push({
        clipId: clip.id,
        mediaId,
        name,
        start: clip.start,
        end: clip.end,
        duration: clip.duration,
        captionEs: '',
        captionEn: '',
        title: '',
      });
    }

    await rm(videoDir, { recursive: true, force: true });

    try {
      const sourceName = analysis.filename || 'video';
      const captions = await generateCaptions(sourceName, clipNames);
      for (let i = 0; i < results.length; i++) {
        if (captions[i]) {
          results[i].captionEs = captions[i].es;
          results[i].captionEn = captions[i].en;
          results[i].title = captions[i].title;
        }
      }
    } catch (err) {
      console.error('[Captions] Failed to generate captions:', err);
    }

    res.json({ total: clips.length, clips: results });
  } catch (err) {
    next(err);
  }
});

router.delete('/:videoId', async (req, res, next) => {
  try {
    const videoDir = resolve(TEMP_DIR, req.params.videoId);
    await rm(videoDir, { recursive: true, force: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
