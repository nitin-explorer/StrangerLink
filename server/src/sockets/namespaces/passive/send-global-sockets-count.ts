import { globalActiveIPsKey } from "@shared/keys/user-keys.js";
import { Namespace, Socket } from "socket.io";
import { client } from "src/lib/redis-clients.js";

 export const sendGlobalSocketsCount  = async(socket: Socket, namespace: Namespace, action: 'add' | 'remove')=>{
    
    const cleanedIp = socket.handshake.address.replace(/[^a-fA-F0-9.]/g, '');
    const key = globalActiveIPsKey(cleanedIp);

    if(action === 'add') await client.sAdd(key, socket.id ) 
    if(action === 'remove') await client.sRem(key, socket.id )

    let count = 0;
    const pattern = globalActiveIPsKey('*');
    for await (const _key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        count++;
    }

    namespace.emit('global-sockets-count', count)
}