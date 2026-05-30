import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { LocalDB } from './backend/database';
import apiRouter from './backend/routes/api';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard express JSON parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Dynamic cors setup
  app.use(cors({
    origin: '*', // Allows sandbox browser accesses
    credentials: true
  }));

  // Serve backend media uploads publicly under /uploads
  const uploadRoot = path.join(process.cwd(), 'backend', 'uploads');
  app.use('/uploads', express.static(uploadRoot));

  // Mount API Endpoints FIRST
  app.use('/api', apiRouter);

  // Serve static files / index in Production or boot Vite in Dev
  if (process.env.NODE_ENV !== 'production') {
    console.log('--- Development Mode (Vite Middleware Booting) ---');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('--- Production Mode (Static Build Serving) ---');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app._router.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Master server running on http://0.0.0.0:${PORT}`);
    console.log("ENV_KEYS_LOG:", Object.keys(process.env).filter(k => !k.startsWith("npm_") && !k.startsWith("NODE_")));
    try {
      await LocalDB.pullFromFirestore();
    } catch (e) {
      console.error("Boot Time Cloud Synchronizer Error:", e);
    }
  });
}

startServer().catch(err => {
  console.error('Failed to launch full-stack Express server:', err);
});
