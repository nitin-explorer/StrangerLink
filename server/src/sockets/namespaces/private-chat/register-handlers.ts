import { Socket,  Namespace, Server } from 'socket.io';

import { cacheUsersInRoomKey } from '@shared/keys/rooms-keys.js';
import { onSendMessage } from './controllers/on-send-message.js';
import { onJoinRoom } from './controllers/on-join-room.js';
import { onDisconnect } from './controllers/on-disconnect.js';
import { onLeaveRoom } from './controllers/on-leave-room.js';
import { onLeaveRoomForever } from './controllers/on-leave-room-forever.js';
import { client } from 'src/lib/redis-clients.js';
import { checkRateLimit } from 'src/lib/socket-ratelimiter.js';


																//* I left io unused on purpose.
export const registerSocketHandlers = (socket: Socket, namespace: Namespace, _io: Server) => {

	const userId = socket.user?.id;
	socket.on('send-message', async (payload: ClientPrivateMessage) => {
		if (!userId) return;
		if (await checkRateLimit(client, socket, 'send-message')) {
			return socket.emit('error-event', { error: 'Too many messages. Please slow down.' });
		}
		try {
			await onSendMessage(socket, payload, userId);
		} catch (err) {
			console.error('send-message error:', err);
			socket.emit('error-event', { error: 'Internal server error' });
		}
	});

	socket.on('join-room', async (roomId: string, cb) => {
		if (!userId) return;
		if (await checkRateLimit(client, socket, 'join-room')) {
			return socket.emit('error-event', { error: 'Too many join requests. Please slow down.' });
		}
		try {
			await onJoinRoom(socket, namespace, userId, roomId, cb);
		} catch (err) {
			console.error('join-room error:', err);
			socket.emit('error-event', { error: 'Internal server error' });
		}
	});

	socket.on('leave-room', async (roomId: string) => {
		if (!userId) return;
		if (await checkRateLimit(client, socket, 'leave-room')) return;
		try {
			await onLeaveRoom(socket, namespace, userId, roomId);
		} catch (err) {
			console.error('leave-room error:', err);
		}
	});

	socket.on('disconnect', async () => {
		if (!userId) return;
		try {
			await onDisconnect(namespace, socket, userId);
		} catch (err) {
			console.error('disconnect error:', err);
		}
	});

	socket.on('leave-room-forever', async (roomId: string)=>{
		if (!userId) return;
		if (await checkRateLimit(client, socket, 'leave-room-forever')) return;
		try {
			await onLeaveRoomForever(socket, namespace, roomId)
			await onLeaveRoom(socket, namespace, userId, roomId)
		} catch (err) {
			console.error('leave-room-forever error:', err);
		}
	})

	socket.on('send-typing', async (roomId: string)=>{
		if (!socket.user?.username || !userId) return;
		if (await checkRateLimit(client, socket, 'send-typing')) return;
		try {
			const isMember = await client.hExists(cacheUsersInRoomKey(roomId), userId)
			if (!isMember) return;
			socket.to(roomId).emit('receive-typing', socket.user.username)
		} catch (err) {
			console.error('send-typing error:', err);
		}
	})

	socket.on('send-stop-typing', async (roomId: string)=>{
		if (!socket.user?.username || !userId) return;
		if (await checkRateLimit(client, socket, 'send-stop-typing')) return;
		try {
			const isMember = await client.hExists(cacheUsersInRoomKey(roomId), userId)
			if (!isMember) return;
			socket.to(roomId).emit('receive-stop-typing', socket.user.username)
		} catch (err) {
			console.error('send-stop-typing error:', err);
		}
	})


	socket.emit('ready');

	return;
};
