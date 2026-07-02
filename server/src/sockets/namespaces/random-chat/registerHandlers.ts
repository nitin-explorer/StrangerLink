import { Socket,  Namespace} from 'socket.io';
import { client } from 'src/lib/redis-clients.js';
import { checkRateLimit } from 'src/lib/socket-ratelimiter.js';
import { onFindMatch } from './controllers/on-find-match.js';
import { onStopSearch } from './controllers/on-stop-search.js';
import { onDisconnect } from './controllers/on-disconnect.js';
import { onLeaveRoom } from './controllers/on-leave-room.js';
import { onSendMessage } from './controllers/on-send-message.js';
import { onSendInvite } from 'src/sockets/on-send-invite.js';


export const registerSocketHandlers = (socket: Socket, namespace: Namespace) => {
    socket.on('send-message', async(payload: ClientPrivateMessage, cb)=>{
        if (await checkRateLimit(client, socket, 'send-message')) {
            return cb({ error: 'Too many messages. Please slow down.' });
        }
        try {
            await onSendMessage(socket, payload, cb)
        } catch (err) {
            console.error('random send-message error:', err);
            cb({ error: 'Internal server error' });
        }
    })

    socket.on('find-match', async ()=>{
        if (await checkRateLimit(client, socket, 'find-match')) return;
        try {
            await onFindMatch(socket, namespace)
        } catch (err) {
            console.error('find-match error:', err);
            socket.emit('error-event', { error: 'Internal server error' });
        }
    })

    socket.on('stop-search', async ()=>{
        if (await checkRateLimit(client, socket, 'stop-search')) return;
        try {
            await onStopSearch(socket)
        } catch (err) {
            console.error('stop-search error:', err);
        }
    })

    socket.on('disconnect', async ()=>{
        try {
            await onDisconnect(socket)
        } catch (err) {
            console.error('random disconnect error:', err);
        }
    })

    socket.on('leave-room', async ()=>{
        if (await checkRateLimit(client, socket, 'leave-room')) return;
        try {
            await onLeaveRoom(socket)
        } catch (err) {
            console.error('random leave-room error:', err);
        }
    })


	socket.on('send-typing', async ()=>{
		if (!socket.data.matchRoom) return;
		if (await checkRateLimit(client, socket, 'send-typing')) return;
		socket.to(socket.data.matchRoom).emit('receive-typing',socket.user?.username || 'Stranger')
	})

	socket.on('send-stop-typing', async ()=>{
		if (!socket.data.matchRoom) return;
		if (await checkRateLimit(client, socket, 'send-stop-typing')) return;
		socket.to(socket.data.matchRoom).emit('receive-stop-typing' ,socket.user?.username || 'Stranger')
	})

    
    if(socket.user){
        socket.on('send-room-invite', async (payload: InviteToRoomMessage)=>{
            if (await checkRateLimit(client, socket, 'send-room-invite')) return;
            try {
                await onSendInvite(socket,  payload, socket.data.matchRoom)
            } catch (err) {
                console.error('random send-room-invite error:', err);
            }
        })
    };
}

