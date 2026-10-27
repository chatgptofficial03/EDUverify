import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = true;
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('Initializing Next.js App...');
app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, () => {
    console.log(`> EduVerify Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err);
  process.exit(1);
});
