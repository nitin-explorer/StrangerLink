import { cacheUsersInRoomKey } from "@shared/keys/rooms-keys.js";
import { Socket } from "socket.io";
import { client } from "src/lib/redis-clients.js";
import { prisma } from "src/lib/db.js";

export const onSendInvite = async(socket: Socket, payload: InviteToRoomMessage, receiverRoomOrSocket: string)=>{

    const isMember = await prisma.roomUser.findFirst({
        where: {
            userId: socket.user?.id,
            roomId: payload.roomId,
        },
    });

    if (!isMember) {
        socket.emit('error-event', 'You are not a member of this room.');
        return;
    }

    socket.to(receiverRoomOrSocket).emit('receive-room-invite', {roomId: payload.roomId, username: socket.user?.username})
    if(!payload.strangerInviteInfo?.userId){
        socket.emit('error-event', 'Stranger is not a registered user :(')
        return
    } 
    await client.hSet(cacheUsersInRoomKey(payload.roomId), {[payload.strangerInviteInfo?.userId]: 'invited'})
    return
}