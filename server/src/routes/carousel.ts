import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import { randomUUID } from 'crypto';
import {
  generateSlideTexts,
  generateCarouselCaption,
  generateSeriesTexts,
} from '../services/slideGenerator.js';
import {
  generateSlideImage,
  getImagePath,
  cleanupSession,
} from '../services/imageGenerator.js';
import { createDriveFolder, uploadToDrive } from '../services/googleDrive.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post('/generate-texts', async (req, res, next) => {
  try {
    const { topic, slideCount, language } = req.body;
    if (!topic || !slideCount) {
      res.status(400).json({ error: 'topic and slideCount are required' });
      return;
    }

    const sessionId = randomUUID();
    const slides = await generateSlideTexts(topic, slideCount, language ?? 'es');
    res.json({ sessionId, slides });
  } catch (err) {
    next(err);
  }
});

router.post('/generate-image', async (req, res, next) => {
  try {
    const { sessionId, slideNumber, prompt, carouselIndex } = req.body;
    if (!sessionId || !slideNumber || !prompt) {
      res.status(400).json({ error: 'sessionId, slideNumber, and prompt are required' });
      return;
    }

    const imageUrl = await generateSlideImage(
      sessionId, slideNumber, prompt,
      carouselIndex !== undefined ? Number(carouselIndex) : undefined,
    );
    res.json({ imageUrl });
  } catch (err) {
    next(err);
  }
});

router.post('/generate-series-texts', async (req, res, next) => {
  try {
    const { seriesTopic, carouselCount, slidesPerCarousel, language } = req.body;
    if (!seriesTopic || !carouselCount || !slidesPerCarousel) {
      res.status(400).json({ error: 'seriesTopic, carouselCount, slidesPerCarousel required' });
      return;
    }

    const sessionId = randomUUID();
    const carousels = await generateSeriesTexts(
      seriesTopic, carouselCount, slidesPerCarousel, language ?? 'es',
    );
    res.json({ sessionId, carousels });
  } catch (err) {
    next(err);
  }
});

router.post('/generate-caption', async (req, res, next) => {
  try {
    const { slides, language } = req.body;
    if (!slides || !Array.isArray(slides)) {
      res.status(400).json({ error: 'slides array is required' });
      return;
    }

    const caption = await generateCarouselCaption(slides, language ?? 'es', req.body.series);
    res.json({ caption });
  } catch (err) {
    next(err);
  }
});

router.get('/image/:sessionId/:slideNumber', (req, res) => {
  const { sessionId, slideNumber } = req.params;

  if (!/^[a-f0-9-]{36}$/.test(sessionId)) {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  const num = parseInt(slideNumber);
  if (isNaN(num) || num < 1 || num > 20) {
    res.status(400).json({ error: 'Invalid slide number' });
    return;
  }

  const filePath = getImagePath(sessionId, num);
  if (!filePath) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(filePath).pipe(res);
});

router.get('/image/:sessionId/:carouselIndex/:slideNumber', (req, res) => {
  const { sessionId, carouselIndex, slideNumber } = req.params;

  if (!/^[a-f0-9-]{36}$/.test(sessionId)) {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  const ci = parseInt(carouselIndex);
  const sn = parseInt(slideNumber);
  if (isNaN(ci) || isNaN(sn) || sn < 1) {
    res.status(400).json({ error: 'Invalid params' });
    return;
  }

  const filePath = getImagePath(sessionId, sn, ci);
  if (!filePath) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(filePath).pipe(res);
});

router.post('/create-drive-folder', async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    if (!name || !parentId) {
      res.status(400).json({ error: 'name and parentId are required' });
      return;
    }
    const folderId = await createDriveFolder(name, parentId);
    res.json({ folderId });
  } catch (err) {
    next(err);
  }
});

router.post('/save-to-drive', upload.array('slides', 20), async (req, res, next) => {
  try {
    const { folderId, caption, topic } = req.body;
    if (!folderId) {
      res.status(400).json({ error: 'folderId is required' });
      return;
    }

    const files = (req.files as Express.Multer.File[]) ?? [];
    const date = new Date().toISOString().slice(0, 10);
    const shortTopic = (topic ?? 'Carousel').slice(0, 40).trim();
    const folderName = `Carousel - ${shortTopic} - ${date}`;

    const subfolderId = await createDriveFolder(folderName, folderId);

    for (let i = 0; i < files.length; i++) {
      const name = `slide-${String(i + 1).padStart(2, '0')}.png`;
      await uploadToDrive(files[i].buffer, name, 'image/png', subfolderId);
    }

    if (caption) {
      await uploadToDrive(Buffer.from(caption, 'utf-8'), 'caption.txt', 'text/plain', subfolderId);
    }

    res.json({ folderId: subfolderId, folderName });
  } catch (err) {
    next(err);
  }
});

router.delete('/session/:sessionId', (req, res) => {
  cleanupSession(req.params.sessionId);
  res.json({ ok: true });
});

export default router;
