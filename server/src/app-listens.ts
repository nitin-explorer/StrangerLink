import {server} from "./sockets-setup.js";
import { prisma } from './lib/db.js';
import { client } from './lib/redis-clients.js';

if (!process.env.JWT_SECRET) {
	console.error('FATAL: JWT_SECRET environment variable is not set');
	process.exit(1);
}

const port = process.env.PORT || 3001;
server.listen(port, () => {
	console.log('Server started on port ' + port);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
  await client.quit();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

