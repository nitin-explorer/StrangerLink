import { useSocket } from '@/context/generic-socket-context';
import {  useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useTypingReceiver } from './useTypingReceiver';

export function useChatSocket(
	roomId: string,
	handleMessage?: (msg: ClientPrivateMessage) => void,
	updateOnlineCount?: (onlineUsersCount: number) => void,
	setUsersTyping?: (usersTyping: string[]) => void
) {
	const socket = useSocket();
	const router = useRouter();
	const currentUsersTyping = useRef<Set<string>>(new Set());
	
	useEffect(() => {
		socket.on('error', (e) => {
			console.error(e);
		});
		socket.on('connect_error', (e) => {
			console.error(e);
		});

		socket.on('error-event', (e: string) => {
			console.error(e);
		});


		if(handleMessage){
			socket.on('receive-message', (payload: ClientPrivateMessage) => {
				handleMessage(payload);
			});
	
			socket.on('receive-event', (payload: EventMessage)=>{
				handleMessage(payload)
			})

		}
		if(updateOnlineCount){
			socket.on('get-online-users', (serverPayload: number)=>{
				updateOnlineCount(serverPayload)
			})
		}
		if(setUsersTyping){
			useTypingReceiver(socket, currentUsersTyping, setUsersTyping)
		}

		socket.on( 'prevent-duplicate-connection', (_serverPayload: { msg: string }) => {
				router.push('/duplicate-connection');
			}
		);
		

		socket.on('kick-out', (serverPayload: string)=>{
			const receivedRoomId = serverPayload
			
			if(roomId === receivedRoomId){
				router.push('/chat')
			}
		})



		socket.on('ready', onReady);
		
		function tryJoinRoom  ()  {
			socket.emit('join-room', roomId, (_res: string) => {});
		};
	
		function onReady () {
			if(roomId === 'home' || roomId === 'profile' ) return
			tryJoinRoom();
		};


		if (!socket.connected) {
			socket.connect();
		}else {
			onReady();
		}

		return () => {
			socket.off('ready');
			socket.off('receive-message');
			socket.off('receive-event');
			socket.off('error-event');
			socket.off('connect_error');
			socket.off('error');
			socket.off('kick-out');
			socket.off('join-room');
			socket.off('get-online-users');
			socket.off('prevent-duplicate-connection');
			socket.off('receive-typing');
			socket.off('receive-stop-typing');
			socket.emit('leave-room', roomId, (_res: string) => {});
		};
	}, [roomId, socket]);
}
