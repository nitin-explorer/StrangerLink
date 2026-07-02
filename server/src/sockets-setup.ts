import app from './express-setup.js';

import { Server } from 'socket.io';
import crypto from 'crypto';
import { createServer } from 'http';
import { middleWare, strictAuthMiddleware } from './sockets/middleware.js';
import { onConnection as  onPrivateConnection} from './sockets/namespaces/private-chat/controllers/on-connection.js';
import { onConnection as onPassiveConnection } from './sockets/namespaces/passive/controllers/on-connection.js';
import { onConnection as onRandomConnection } from './sockets/namespaces/random-chat/controllers/on-connection.js';
import { onConnection as onGlobalConnection } from './sockets/namespaces/global/controllers/on-connection.js';
import { prisma } from './lib/db.js';


const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

export const server = createServer(app);

export const io = new Server(server, {
	cors: {
		origin: corsOrigin,
		credentials: true,
	},

	maxHttpBufferSize: 1 * 1024 * 1024, // 1MB
})


//* P A S I V E
const passiveIo = io.of('/passive')
passiveIo.use(strictAuthMiddleware)
passiveIo.on('connection', (socket)=>{
	onPassiveConnection(socket, passiveIo)
})


//* P R I V A T E
export const privateChatIo = io.of('/private')
privateChatIo.use(strictAuthMiddleware)
privateChatIo.on('connection', async (socket)=>{
	onPrivateConnection(socket, privateChatIo, io)
})	


//* R A N D O M
const randomChatIo = io.of('/random')
randomChatIo.use(middleWare)
randomChatIo.on('connection', (socket)=>{
	onRandomConnection(socket, randomChatIo)
})


//* G L O B A L
const globalChatIo = io.of('/global')
globalChatIo.use(middleWare)
globalChatIo.on('connection', (socket)=>{
	onGlobalConnection(socket, globalChatIo)
})


await prisma.user.upsert({
	create: {
		email: 'CONSTRUCTOR',
		hash:  crypto.randomUUID(),
		id: 'CONSTRUCTOR',
		username: 'CONSTRUCTOR',
	},
	update: {},
	where:  {id: 'CONSTRUCTOR'},
})

await prisma.room.upsert({
	create: {
		isPrivate: false,
		roomName: 'GLOBAL',
		id: 'GLOBAL',
		createdById: 'CONSTRUCTOR',
	},
	update: {},
	where: {id: 'GLOBAL'},
})