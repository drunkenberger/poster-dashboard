import { Router } from 'express';
import apiClient from '../utils/apiClient.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { data } = await apiClient.get('/social-accounts', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/social-accounts/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
