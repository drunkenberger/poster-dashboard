import { Router } from 'express';
import { generateSingleCaption } from '../services/captions.js';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { videoName, existingCaptions } = req.body;
    if (!videoName) {
      res.status(400).json({ error: 'videoName is required' });
      return;
    }

    const caption = await generateSingleCaption(
      videoName,
      Array.isArray(existingCaptions) ? existingCaptions : [],
    );
    res.json(caption);
  } catch (err) {
    next(err);
  }
});

export default router;
