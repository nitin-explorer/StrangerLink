import { MatchStatus } from '@/components/random-chat/FindMatchButton';
import { useSocket } from '@/context/generic-socket-context';
import { useRandomChatContext } from '@/context/RandomRoomContext';
import { useEffect, useRef} from 'react';
import toast from 'react-hot-toast';
import { useTypingReceiver } from './useTypingReceiver';
import { invitedToRoomToast } from '@/components/shared/InvitedToRoomToast';

//prettier-ignore
export function useRandomSocket(
	setStatus: (status: MatchStatus) => void,
	insertMessage: (message: ClientPrivateMessage) => void,
	setUsersTyping: (usersTyping: string[]) => void
) {
	const socket = useSocket();
	const {setDisabled, setStrangerInviteInfo} = useRandomChatContext();
	const currentUsersTyping = useRef<Set<string>>(new Set())
	useTypingReceiver(socket, currentUsersTyping, setUsersTyping)

	useEffect(() => {
		socket.on('error', (e) => {
			console.error(e);
		});
		socket.on('connect_error', (e) => {
			console.error(e);
		});

		socket.on('error-event', (payload: string)=>{
			toast.error(payload)
		})

		socket.on('match-found', () => {
			setStatus('found');
			insertMessage({
				messageType: 'event',
				textContent: 'You are connected, say "Happy dogs day!" ',
				userId: 'event-user',
				identifier: 'event',
				roomId: (socket as any).data?.matchRoom || 'random room',
				username: 'green',
				timeStamp: new Date()
			} as EventMessage);
			insertMessage({
				messageType: 'event',
				textContent: "⚠️ Messages won't be saved. Create a private room to persist all messages. ",
				userId: 'event-user',
				identifier: 'event',
				roomId: (socket as any).data?.matchRoom || 'random room',
				username: 'gray',
				timeStamp: new Date()
			} as EventMessage);
			setDisabled(false);
			
		});

		socket.on('receive-message', (payload: ClientPrivateTextMessage,) => {
				insertMessage(payload);
			}
		);

		socket.on('receive-stranger-info', (payload: StrangerInfoPayload)=>{
			setStrangerInviteInfo(payload)
		})
		
		
		socket.on('stranger-left', () => {
			setStatus('stranger-left');
			setDisabled(true);
			insertMessage({
				messageType: 'event',
				textContent: 'Stranger left',
				userId: 'event-user',
				identifier: 'event',
				roomId: (socket as any).data?.matchRoom || 'random room',
				username: 'gray',
				timeStamp: new Date()
			} as EventMessage);
			setUsersTyping([]);
		});

		socket.on('receive-room-invite', (payload: {roomId: string, username: string})=>{
				
			invitedToRoomToast(payload)
	
		})
	


		if (!socket.connected) {
			socket.connect();
		}
		return () => {
			socket.disconnect();
			socket.off('connect_error');
			socket.off('error');
			socket.off('error-event');
			socket.off('match-found');
			socket.off('receive-message');
			socket.off('stranger-left');
			socket.off('receive-room-invite');
			socket.off('receive-stranger-info');
			socket.off('receive-typing');	
			socket.off('receive-stop-typing');	
		};
	}, [socket]);
}
