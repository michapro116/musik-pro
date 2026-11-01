import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from built Vite directory
app.use(express.static(distPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webmanifest') || filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Basic API health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'MiMusic Pro Server', timestamp: Date.now() });
});

// Single Page Application fallback - always serve index.html for unmatched GET routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MiMusic Pro server listening on http://0.0.0.0:${PORT}`);
});
