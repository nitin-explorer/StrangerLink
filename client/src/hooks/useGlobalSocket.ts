import { useSocket } from '@/context/generic-socket-context';
import { useEffect, useRef } from 'react';
import { useTypingReceiver } from './useTypingReceiver';
import { useSession } from '@/context/session-context';

export function useGlobalSocket(
    insertMessage: (message: ClientPrivateMessage) => void,
    setUsersTyping: (usersTyping: string[]) => void,
    setChatIdentifier: (chatIdentifier: string) => void
) {
    const { session } = useSession() as { session: UserSession | null }; 
    const socket = useSocket();
    const currentUsersTyping = useRef<Set<string>>(new Set())

    useEffect(() => {
        socket.on('error', (e) => {
            console.error(e);
        });
        socket.on('connect_error', (e) => {
            console.error(e);
        });

        socket.on( 'receive-message', (payload: ClientPrivateTextMessage,) => {
                insertMessage(payload);
            }
        );

        socket.on('ready', onReady)

        function tryJoinRoom  ()  {
            const identifier = session?.id ? session.id : socket.id!
            setChatIdentifier(identifier);
			socket.emit('join-room', session?.username || identifier);

		};

        function onReady (){
            tryJoinRoom();
        }
        if (!socket.connected) {
            socket.connect();
        }else{
            onReady();
        }


        useTypingReceiver(socket, currentUsersTyping, setUsersTyping)
    
        return () => {
            socket.disconnect();
            socket.off('connect_error');
            socket.off('error');
            socket.off('receive-message');
            socket.off('ready');
        };
    }, [socket]);
}
