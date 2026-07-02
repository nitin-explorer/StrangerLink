import { cacheUsersInRoomKey, connectedUsersInRoomKey } from '@shared/keys/rooms-keys.js';
import { userRoomsKey } from '@shared/keys/user-keys.js';
import { Namespace, Socket } from 'socket.io';
import { client } from 'src/lib/redis-clients.js';
import { sendOnlineUsersCount } from '../utils/shared-sockets.js';
import { RedisClientType } from 'redis';

export const onLeaveRoom = async (socket: Socket, io: Namespace, userId: string,  roomId: string) => {
	
	const role = await client.hGet(cacheUsersInRoomKey(roomId), userId);
	if (!role) {
		return;
	}

	await Promise.all(
		[
			client.sRem(connectedUsersInRoomKey(roomId), userId),
			client.sRem(userRoomsKey(userId), roomId),
		] 
	);

	await sendOnlineUsersCount(roomId, client as RedisClientType, io);
	socket.leave(roomId);

	return;
};
