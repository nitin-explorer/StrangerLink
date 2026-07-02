import { Socket } from "socket.io"
import { onStopSearch } from "./on-stop-search.js"
import { client } from "src/lib/redis-clients.js"
import { usersInRandomRoom } from "@shared/keys/rooms-keys.js"

export const onDisconnect = async(socket: Socket)=>{

    if (socket.data.matchRoom) {
        socket.to(socket.data.matchRoom).emit('stranger-left')
        await client.del(usersInRandomRoom(socket.data.matchRoom))
    }
    await onStopSearch(socket)
    //! I ended up managing to send the socket and user id through direct payload so this KEY doesn't have a purpose.
    return
}