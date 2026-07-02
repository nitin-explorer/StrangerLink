import { Namespace, Socket } from "socket.io"
import { registerSocketHandlers } from "../registerHandlers.js";

export const onConnection = (socket: Socket, _namespace: Namespace)=>{
    registerSocketHandlers(socket, _namespace)
}