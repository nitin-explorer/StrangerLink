import { Namespace, Socket } from "socket.io"
import { registerSocketHandlers } from "../register-handlers.js";

export const onConnection = (socket: Socket, namespace: Namespace)=>{
    registerSocketHandlers(socket, namespace)
}