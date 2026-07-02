import chalk from 'chalk';
import {createClient, RedisClientType} from 'redis'
import { privateChatIo } from 'src/sockets-setup.js';
import { onKick } from 'src/sockets/namespaces/private-chat/controllers/on-kick.js';

if(!process.env.REDIS_PORT || !process.env.REDIS_HOST){
    throw new Error('REDIS_PORT and REDIS_HOST must be defined')
}

const redisPassword = process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.trim() : undefined;

export const client = createClient({
    socket :  {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        tls: true,
        rejectUnauthorized: false
    },
    password: redisPassword
})
client.on('connect', ()=>{
    console.log(chalk.inverse.green('Client connected to redis'));
})
client.on('error', (err) => {
    console.error('Redis client error:', err.message);
})
client.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
})

await  client.connect()

const kickUserSubscriber = createClient({
    socket :  {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        tls: true,
        rejectUnauthorized: false
    },
    password: redisPassword
})
kickUserSubscriber.on('error', (err) => {
    console.error('Redis kick-user subscriber error:', err.message);
})

await kickUserSubscriber.connect()

await kickUserSubscriber.subscribe('kick-user', async (msg: string)=>{
    try {
        await onKick(privateChatIo, client as RedisClientType, msg)
    } catch (err) {
        console.error('Error handling kick-user event:', err);
    }
})