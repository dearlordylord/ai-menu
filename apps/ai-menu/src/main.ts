import Fastify from 'fastify';
import cors from '@fastify/cors'
import { app } from './app/app';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

const allowedOrigins = [...(process.env.ALLOWED_ORIGINS?.split(',') ?? []), 'localhost'];

server.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const hostname = new URL(origin).hostname
    if (allowedOrigins.includes(hostname)) {
      cb(null, true)
      return
    }
    cb(new Error('Origin Not allowed'), false)
  }
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
