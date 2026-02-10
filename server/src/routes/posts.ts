import { Router } from 'express';
import apiClient from '../utils/apiClient.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { data } = await apiClient.get('/posts', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { data } = await apiClient.post('/posts', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/posts/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { data } = await apiClient.patch(`/posts/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await apiClient.delete(`/posts/${req.params.id}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
