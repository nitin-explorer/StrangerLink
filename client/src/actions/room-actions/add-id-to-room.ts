"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { client } from "@/lib/redis-clients";
import { cacheUsersInRoomKey } from "@shared/keys/rooms-keys";

export const addIdToRoom = async (userId: string, roomId: string) => {
    const headerStore = await headers();
    const callerUserId = headerStore.get('userId');

    if (!callerUserId) {
        return { success: false, msg: 'Unauthorized.' };
    }

    const callerMembership = await prisma.roomUser.findFirst({
        where: {
            userId: callerUserId,
            roomId,
            role: 'admin',
        },
    });

    if (!callerMembership) {
        return { success: false, msg: 'Only room admins can add users.' };
    }

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            username: true,
            id: true,
        },
    });

    if (!user) return { success: false, msg: 'User not found.' };

    const existingRoomUser = await prisma.roomUser.findFirst({
        where: {
            userId,
            roomId,
        },
    });
    if (existingRoomUser) return { success: false, msg: 'User already in room.' };

    const result = await prisma.roomUser.create({
        data: {
            userId,
            roomId,
            role: 'member',
            unReadMessages: 0,
        },
    });

    console.log({result});
    


    await client.hSet(cacheUsersInRoomKey(roomId), {
        [userId]: 'member',
    });

    return { success: true, msg: 'Success', user };
};

