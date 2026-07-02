import { cacheUsersInRoomKey, connectedUsersInRoomKey } from '@shared/keys/rooms-keys.js';
import { Socket } from 'socket.io';
import { prisma } from 'src/lib/db.js';
import { client } from 'src/lib/redis-clients.js';
import { saveTextMessage } from 'src/lib/save-text-messages.js';

export const onSendMessage = async (socket: Socket, payload: ClientPrivateMessage, userId: string) => {

	const role = await client.hGet(cacheUsersInRoomKey(payload.roomId), userId);
	if (!role) {
		const memberCheck = await prisma.roomUser.findUnique({
			where: { userId_roomId: { userId, roomId: payload.roomId } },
		});
		if (!memberCheck) {
			socket.emit('error-event', { error: 'You are not a member of this room.' });
			return;
		}
	}

	if (payload.messageType === 'file') {
		//* File gets saved in Next
	} else if (payload.messageType === 'text') {
		const result = await saveTextMessage(payload as ClientPrivateTextMessage, userId);

		if(!result.success) return socket.emit('error-event', result.msg);

	} else {
		socket.emit('error-event', { error: 'Invalid content Type' });
		return;
	}

	const usersInRoom = await prisma.roomUser.findMany({
		where: {
			roomId : payload.roomId,
		},
		select: {
			user: {
				select: {
					id: true,
				}
			}
		}
	})

	const usersInRoomIds = usersInRoom.map((user) => user.user.id)

	const usersInRoomSocketIds = await client.sMembers(connectedUsersInRoomKey(payload.roomId))

	const offlineUserIds = usersInRoomIds.filter(id => !usersInRoomSocketIds.includes(id))

	if (offlineUserIds.length > 0) {
		await prisma.roomUser.updateMany({
			where: {
				userId: { in: offlineUserIds },
				roomId: payload.roomId,
			},
			data: {
				unReadMessages: { increment: 1 }
			}
		})
	}

	const securePayload = {
		...payload,
		userId: socket.user?.id || userId,
		identifier: socket.user?.id || userId,
	};
	socket.broadcast
		.to(payload.roomId)
		.emit('receive-message', securePayload);

	return;
};
