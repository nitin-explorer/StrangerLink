import { Socket } from 'socket.io';
import { handleBlobMessage } from 'src/sockets/handle-blob-message.js';

const MAX_TEXT_LENGTH = 2000;

//prettier-ignore
export const onSendMessage = async (
	socket: Socket,
	payload: ClientPrivateMessage,
	cb: ({error}: {error: string | null}) => void
) => {

	if (payload.messageType === 'text') {
		const textContent = (payload.textContent || '').trim().slice(0, MAX_TEXT_LENGTH);
		if (!textContent) {
			cb({error: 'Message cannot be empty'});
			return;
		}
		const sanitizedPayload = { ...payload, textContent, userId: socket.user?.id || 'anonymous', identifier: socket.user?.id || 'anonymous' };
		socket.to(socket.data.matchRoom).emit('receive-message', sanitizedPayload);
        cb({error: null})
	} else if (payload.messageType === 'file' && payload.bytes) {
		const result = handleBlobMessage(payload);

		if (!result.success) {
			cb({error: result.message});
			return;
		}

		socket.to(socket.data.matchRoom).emit('receive-message', {...payload, userId: socket.user?.id || 'anonymous', identifier: socket.user?.id || 'anonymous'});
		cb({error: null})
	} else {
		cb({error: 'Invalid message type'});
	}
};
