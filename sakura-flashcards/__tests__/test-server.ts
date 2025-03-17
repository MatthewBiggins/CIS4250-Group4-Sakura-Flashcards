import next from 'next';
import { createServer, Server } from 'http';
import { parse } from 'url';
import { NextServer } from 'next/dist/server/next';

const TestServer = {
  server: null as Server | null,
  app: null as NextServer | null,


  async start() {

    const port = 3000;
    const dev = process.env.NODE_ENV !== 'production';
      
    this.app = next({ dev });
    const handle = this.app.getRequestHandler();

    await this.app.prepare();

    this.server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    await this.server.listen(port);
    console.log(`> Server running on http://localhost:${port}`);
  },

  async stop() {
    await this.server?.close();
    console.log('Server stopped');
    await this.app?.close();
    console.log('App closed');
  },

  async test(){
    await this.start();
    await this.stop();
  }
};

export default TestServer;