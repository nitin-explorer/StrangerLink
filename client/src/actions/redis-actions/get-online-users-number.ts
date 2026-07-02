"use server"

import { client } from '@/lib/redis-clients';

import { connectedUsersInRoomKey } from '@shared/keys/rooms-keys';
import { globalActiveIPsKey } from '@shared/keys/user-keys';






export const getOnlineUsersInRoomNumber = async(roomId: string)=>{


	const onlineUsersNumber = await client.sCard(connectedUsersInRoomKey(roomId)) //$ N or 0

	return onlineUsersNumber
}

export const getOnlineGlobalSocketsCount = async()=>{

	try {
		let count = 0;
		for await (const _key of client.scanIterator({ MATCH: globalActiveIPsKey('*'), COUNT: 100 })) {
			count++;
		}
		return count
	} catch {
		console.error('Redis scan failed in getOnlineGlobalSocketsCount');
		return 0;
	}
}
