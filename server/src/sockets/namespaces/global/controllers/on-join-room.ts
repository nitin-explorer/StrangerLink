import { Socket,  } from 'socket.io';

export const onJoinRoom = ( socket: Socket, chatIdentifier: string, roomName: string)=>{

    socket.join(roomName);

    const sanitizedIdentifier = chatIdentifier.slice(0, 100).replace(/[<>]/g, '');

    socket.to(roomName).emit('receive-message', {
        messageType: 'event',
        textContent: sanitizedIdentifier + ' joined!',
        userId: 'event-user',
        identifier: 'event',
        timeStamp: new Date(),
        roomId: (socket as any).data?.matchRoom || 'random room',
        username: 'green'
    } as EventMessage)

    return
}
