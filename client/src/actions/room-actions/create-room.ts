"use server";


import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { client } from '@/lib/redis-clients';
import { cacheUsersInRoomKey } from '@shared/keys/rooms-keys';
import { withValidation } from '../wrapper-validator';
import { createRoomSchema } from '@/lib/zodSchemas/room-schema';


// prettier-ignore
const _createRoom = async ({roomName, isPrivate}: {roomName: string, isPrivate: boolean}) => {

    const headerStore = await headers()
    const userId = headerStore.get('userId')

    if(!userId){
        return { success: false, msg: 'User not found.' };
    }

    const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!userExists) {
        return { success: false, msg: 'User not found.' };
    }

    const room = await prisma.$transaction(async (tx) => {
        const createdRoom = await tx.room.create({
            data: { createdById: userId, roomName, isPrivate }
        })
        await tx.roomUser.create({
            data: { userId, roomId: createdRoom.id, role: 'admin', unReadMessages: 0 }
        })
        return createdRoom
    })

    await client.hSet(cacheUsersInRoomKey(room.id), { [userId]: 'admin' })

    return { success: true, msg: 'Success' , room};
};

//prettier-ignore
export const createRoom: (data: CreateRoomPayload)=> Promise<CreateRoomActionResponse> = withValidation(_createRoom, createRoomSchema)