import { activeSocketPrivateTab } from "@shared/keys/user-keys.js"
import { RedisClientType } from "redis"
import { Namespace } from "socket.io"
import { sendOnlineUsersCount } from "../utils/shared-sockets.js"
import { sendAndSaveEvent } from "src/sockets/send-event.js"

export const onKick  = async(namespace: Namespace, client: RedisClientType, msg: string)=>{
    let userId: string, roomId: string, kickedBy: string, kicking: string
    try {
        const parsed = JSON.parse(msg)
        userId = parsed.userId
        roomId = parsed.roomId
        kickedBy = parsed.kickedBy
        kicking = parsed.kicking
    } catch {
        console.error('Failed to parse kick-user message:', msg)
        return
    }

    const socketId = await client.get(activeSocketPrivateTab(userId))

    if(!socketId) return

    namespace.to(socketId).emit('kick-out', roomId)
    
    namespace.to(socketId).socketsLeave(roomId)

    await sendAndSaveEvent(namespace, 'red', roomId, `${kicking} was kicked by ${kickedBy}`)
    
    await sendOnlineUsersCount(roomId, client as RedisClientType, namespace);
}