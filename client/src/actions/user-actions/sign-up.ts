"use server"

import { prisma } from "@/lib/db"
import { client } from "@/lib/redis-clients"
import { createSession } from "@/lib/session"
import { userJSONkey } from "@shared/keys/user-keys"
import { rateLimiter } from "@shared/functions/ratelimiter"
import bcryptjs from "bcryptjs"
import { customAlphabet } from "nanoid"
import { headers } from "next/headers"
import { withValidation } from "../wrapper-validator"
import { signupSchema } from "@/lib/zodSchemas/user-schemas"
// import { randomUUID, randomBytes } from "crypto"



//¡ export just for dev
export const _signUp =  async ({ username, email, password }: SignUpPayload) => {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for') || 'unknown';

    const rateLimited = await rateLimiter({
        client: client as any,
        userId: `signup:${ip}`,
        actionKey: 'signup',
        limit: 3,
        windowSizeSecs: 300,
    });

    if (rateLimited) {
        return { success: false, msg: 'Too many accounts created from this IP. Please try again later.' };
    }
    
    const hash = await bcryptjs.hash(password, 10)

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    const nanoid = customAlphabet(alphabet, 10)
    const id = '#' + nanoid()
    
    let user;
    try {
        const created = await prisma.user.create({
            data: { username, email, hash, id}
        })
        const { hash: _hash, ...userData } = created
        user = userData
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, msg: 'User already exists' }
        }
        throw e
    }

    
    await createSession(user.id)


    //* Add to Redis
    const redisData: RedisJsonUserResult = {
        userId: user.id.replace('#', ''),
        data: {
            username: user.username,
            profilePicPath: null
        }
    }
    await client.json.set(userJSONkey(user.id), '$', redisData)


    
    return { success: true, msg: 'User created', user }
}
export const signUp: (data: SignUpPayload) => Promise<SignUpActionResponse> = withValidation(_signUp, signupSchema)