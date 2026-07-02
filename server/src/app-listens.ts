import {server} from "./sockets-setup.js";

if (!process.env.JWT_SECRET) {
	console.error('FATAL: JWT_SECRET environment variable is not set');
	process.exit(1);
}

const port = process.env.PORT || 3001;
server.listen(port, () => {
	console.log('Server started on port ' + port);
});



process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

