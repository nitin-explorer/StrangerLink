import { RefObject, useEffect } from "react"
import { Socket } from "socket.io-client"

export const useTypingReceiver = (socket: Socket, currentUsersTyping: RefObject<Set<string>>, setUsersTyping: (usersTyping: string[]) => void)=>{

    useEffect(() => {
        const onReceiveTyping = (userId: string) => {
            currentUsersTyping.current.add(userId)
            setUsersTyping([...currentUsersTyping.current])
        }

        const onReceiveStopTyping = (userId: string) => {
            currentUsersTyping.current.delete(userId)
            setUsersTyping([...currentUsersTyping.current])
        }

        socket.on('receive-typing', onReceiveTyping)
        socket.on('receive-stop-typing', onReceiveStopTyping)

        return () => {
            socket.off('receive-typing', onReceiveTyping)
            socket.off('receive-stop-typing', onReceiveStopTyping)
        }
    }, [socket])
}
