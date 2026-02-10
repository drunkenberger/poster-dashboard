import { Router } from 'express';
import apiClient from '../utils/apiClient.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { data } = await apiClient.get('/media', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/media/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await apiClient.delete(`/media/${req.params.id}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/upload-url', async (req, res, next) => {
  try {
    const { data } = await apiClient.post('/media/create-upload-url', req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
