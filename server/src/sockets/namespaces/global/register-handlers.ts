import { Socket,  Namespace} from 'socket.io';
import { client } from 'src/lib/redis-clients.js';
import { checkRateLimit } from 'src/lib/socket-ratelimiter.js';
import { onJoinRoom } from './controllers/on-join-room.js';
import { onSendMessage } from './controllers/on-send-message.js';

														
export const registerSocketHandlers = (socket: Socket, _namespace: Namespace) => {

    const roomName = 'global-1'

	
	socket.on('join-room', async (chatIdentifier: string) => {
		if (await checkRateLimit(client, socket, 'join-room')) return;
		try {
			onJoinRoom(socket, chatIdentifier, roomName);
		} catch (err) {
			console.error('global join-room error:', err);
		}
	});
    socket.on('send-message', async (payload: ClientPrivateMessage, cb) => {
		if (await checkRateLimit(client, socket, 'send-message')) {
			return cb({ error: 'Too many messages. Please slow down.' });
		}
		try {
			await onSendMessage(socket, payload, roomName, cb);
		} catch (err) {
			console.error('global send-message error:', err);
			cb({ error: 'Internal server error' });
		}
    });
	
	
	socket.on('send-typing', async ()=>{
		if (await checkRateLimit(client, socket, 'send-typing')) return;
		socket.to(roomName).emit('receive-typing',socket.user?.username || 'Stranger')
	})
	
	socket.on('send-stop-typing', async ()=>{
		if (await checkRateLimit(client, socket, 'send-stop-typing')) return;
		socket.to(roomName).emit('receive-stop-typing' ,socket.user?.username || 'Stranger')
	})
	
	
	socket.emit('ready');

	return;
};
