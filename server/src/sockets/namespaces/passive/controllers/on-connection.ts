import { Namespace, Socket } from "socket.io"
import { registerSocketHandlers } from "../register-handlers.js";
import { client } from "src/lib/redis-clients.js";
import { globalActiveUsersKey } from "@shared/keys/user-keys.js";
import { sendGlobalSocketsCount } from "../send-global-sockets-count.js";

export const onConnection = async(socket: Socket, namespace: Namespace)=>{
    

    await sendGlobalSocketsCount(socket, namespace, 'add')
    
    if(!socket.user){
        socket.on('disconnect', async ()=>{
            await sendGlobalSocketsCount(socket, namespace, 'remove')
        })
        return
    }
    

    
    const userId = socket?.user?.id 
    await client.sAdd(globalActiveUsersKey(socket.user.id), socket.id) 

    await client.expire(globalActiveUsersKey(socket.user.id), 60 * 60)

    namespace.to(userId).emit('status-update', true)

    registerSocketHandlers(socket, namespace)


    return
}