import { matchMakingListKey } from "@shared/keys/matchmaking-keys.js"
import { WatchError } from "redis"
import { Namespace, Socket } from "socket.io"
import { client } from "src/lib/redis-clients.js"
import crypto from 'node:crypto'
import { usersInRandomRoom } from "@shared/keys/rooms-keys.js"
type MatchedUserMessage = {success: boolean, message: string, matchedUserId?: string}

const MAX_MATCH_RETRIES = 5

//prettier-ignore
export const onFindMatch = async(socket1: Socket, namespace: Namespace, _depth = 0): Promise<void>=>{
    if (_depth >= MAX_MATCH_RETRIES) {
        socket1.emit('error-event', { error: 'Could not find a match after multiple attempts. Please try again.' })
        return
    }

    const result: MatchedUserMessage = await client.executeIsolated(async (isoClient)=>{
        let count = 0
        while(count < 5){
            count ++
            try{
                await isoClient.watch(matchMakingListKey())
                const usersWaiting = await isoClient.lLen(matchMakingListKey())
                if (usersWaiting === 0) {
                    const tx = isoClient.multi()
                    tx.lRem(matchMakingListKey(), 0,  socket1.id)
                    tx.rPush(matchMakingListKey(), socket1.id)
                    await tx.exec()
                    return { success: true, message: 'No users waiting, placed in queue' }
                } else{
                    const tx = isoClient.multi()
                    tx.lPop(matchMakingListKey())
                    const [matchedUserId] = await tx.exec()
                    return { success: true, matchedUserId, message: 'Match found' } as MatchedUserMessage
                }
            }catch(e){
                if(e instanceof WatchError) continue
                console.error(e); 
                return { success: false, message: 'Something went wrong, see the log.' }
            }
        }
        return { success: false, message: 'Error: 5th watch error' }
    })

    if(!result.success){
        socket1.emit('error-event', result as MatchedUserMessage)
        return
    }

    if(!result.matchedUserId){
        socket1.emit('placed-in-queue', result.message)
        return
    }

    if (result.matchedUserId === socket1.id) {
        await onFindMatch(socket1, namespace, _depth + 1)
        return
    }
    
    const socket2 = namespace.sockets.get(result.matchedUserId as string)
    
    if(!socket2){
        await onFindMatch(socket1, namespace, _depth + 1)
        return
    }
    const roomId = crypto.randomUUID()

    const socketsArray = [socket1, socket2]

    for (const socket of socketsArray) {
        socket.data.matchRoom = roomId
        socket.join(roomId)
        await client.hSet(usersInRandomRoom(roomId), {[socket.id]: socket.user?.id || ''})
    }
    
    namespace.to(roomId).emit('match-found', roomId, 'Match found')
    
    socket1.emit('receive-stranger-info', {
        socketId: socket2.id, 
        userId: socket2.user?.id || null
    })
    socket2.emit('receive-stranger-info', {
        socketId: socket1.id, 
        userId: socket1.user?.id || null
    } as StrangerInfoPayload)
}