import { Socket,  Namespace} from 'socket.io';
import { onDisconnect } from './controllers/on-disconnect.js';
import { client } from 'src/lib/redis-clients.js';
import { checkRateLimit } from 'src/lib/socket-ratelimiter.js';
import { globalActiveUsersKey } from '@shared/keys/user-keys.js';
import { onSendInvite } from 'src/sockets/on-send-invite.js';


export const registerSocketHandlers = (socket: Socket, namespace: Namespace) => {
	
	const userId = socket.user?.id;
	socket.on('join-room', async (userRoomId, cb)=>{
		if (!userId || userId !== userRoomId) {
			cb('Unauthorized');
			return;
		}
		if (await checkRateLimit(client, socket, 'join-room')) {
			cb('Too many requests. Please slow down.');
			return;
		}

		socket.join('#' + userRoomId)
		cb('Successfully joined room: ' + userRoomId)
	})	

	socket.on('disconnect', async () => {
		if (!userId) return;
		try {
			await onDisconnect(namespace, socket, userId);
		} catch (err) {
			console.error('passive disconnect error:', err);
		}
	});

	socket.on('send-room-invite', async (payload: InviteToRoomMessage)=>{
		if (await checkRateLimit(client, socket, 'send-room-invite')) return;

		if(!payload.strangerInviteInfo?.userId){
			return
		}

		try {
			const invitingActivePassiveSockets = await client.sMembers(globalActiveUsersKey(payload.strangerInviteInfo?.userId))

			await Promise.all(invitingActivePassiveSockets.map((ActivePassiveSocket)=>{
				return onSendInvite(socket, payload, ActivePassiveSocket)
			}))
		} catch (err) {
			console.error('passive send-room-invite error:', err);
		}
	})


	socket.emit('ready');

	return;
};
