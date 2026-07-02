import { Socket } from 'socket.io';
import { prisma } from 'src/lib/db.js';
import { handleBlobMessage } from 'src/sockets/handle-blob-message.js';

const MAX_TEXT_LENGTH = 2000;

//prettier-ignore
export const onSendMessage = async ( socket: Socket, payload: ClientPrivateMessage, roomName: string,
	cb: ({ error }: { error: string | null }) => void
) => {

	if (!socket.user) {
		cb({ error: 'Authentication required to send messages' });
		return;
	}

	const identifier = socket.user.id;
	const userId = socket.user.id;

	if (payload.messageType === 'text') {
		const textContent = (payload.textContent || '').trim().slice(0, MAX_TEXT_LENGTH);
		if (!textContent) {
			cb({ error: 'Message cannot be empty' });
			return;
		}

		const sanitizedPayload = { ...payload, textContent, userId, identifier };
		socket.to(roomName).emit('receive-message', sanitizedPayload);

        await prisma.message.create({
            data: {
                identifier,
                messageType: 'text',
                roomId: 'GLOBAL',
                userId,
                textContent,
            }
        })

        cb({error: null})

	}else if (payload.messageType === 'file' && payload.bytes) {
        const result = handleBlobMessage( payload);

        if(!result.success){
            cb({error: result.message})
            return
            
        }
        socket.to(roomName).emit('receive-message', {...payload, userId, identifier});
		cb({error: null})

        await prisma.message.create({
            data: {
                identifier,
                userId,
                messageType: 'file',
                roomId: 'GLOBAL',
                fileName: payload.fileName,
                fileUrl: null,
                bytes: payload.bytes
            }
        })

	return;
        
    }

};
