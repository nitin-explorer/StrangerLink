"use server";


import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export const getRoomMeta = async (id: string): Promise<RoomMeta | null> => {
    const room = await prisma.room.findFirst({
        where: {
            id,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    username: true,
                },
            },
            roomUser: {
                select: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            profilePicPath: true,

                        },
                    },
                    role: true
                },
            },
        },
    });
    if (!room) return null;

    if (room.isPrivate) {
        const headerStore = await headers();
        const userId = headerStore.get('userId');
        if (!userId) return null;

        const isMember = room.roomUser.some(m => m.user.id === userId);
        if (!isMember) return null;
    }

    return {
        id: room.id,
        roomName: room.roomName,
        isPrivate: room.isPrivate,
        roomPicPath: room.roomPicPath,
        createdBy: {
            id: room.createdBy?.id || undefined,
            username: room.createdBy?.username || undefined,
        },
        users: room.roomUser.map((user) => ({
            id: user.user.id,
            username: user.user.username,
            profilePicPath: user.user.profilePicPath,
            role: user.role
        })),
};
};