import { Namespace,  Server,  Socket } from "socket.io"
import { client } from "src/lib/redis-clients.js"
import { activeSocketPrivateTab } from "@shared/keys/user-keys.js"
import { registerSocketHandlers } from "../register-handlers.js"

export const onConnection = async (socket: Socket, namespace: Namespace, io: Server)=>{
    if(!socket.user){
        socket.emit('error-event', {error: 'FAILED TO AUTHENTICATE, PLEASE SIGN IN.'}) 
        return
    }
	
	const result = await client.getSet(activeSocketPrivateTab(socket.user.id), socket.id)

	if(result && result !== socket.id){
		socket.to(result).emit('prevent-duplicate-connection', {
		msg: 'Another tab is already open. This tab will be closed.'
		},)
		
		namespace.sockets.get(result)?.disconnect()
	} 
	

    registerSocketHandlers(socket, namespace, io)
    return
}