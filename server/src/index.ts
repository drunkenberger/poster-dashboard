import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import accountsRouter from './routes/accounts.js';
import postsRouter from './routes/posts.js';
import mediaRouter from './routes/media.js';
import resultsRouter from './routes/results.js';
import driveRouter from './routes/drive.js';
import videosRouter from './routes/videos.js';
import captionsRouter from './routes/captions.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/accounts', accountsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/results', resultsRouter);
app.use('/api/drive', driveRouter);
app.use('/api/videos', videosRouter);
app.use('/api/captions', captionsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
