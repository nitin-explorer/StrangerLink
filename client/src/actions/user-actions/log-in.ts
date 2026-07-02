"use server"



import { prisma } from "@/lib/db";
import { createSession} from "@/lib/session";
import {  logInSchema} from "@/lib/zodSchemas/user-schemas";
import { client } from "@/lib/redis-clients";
import { rateLimiter } from "@shared/functions/ratelimiter";
import bcryptjs from "bcryptjs"
import { headers } from "next/headers";
import { withValidation } from "../wrapper-validator";




const _logIn = async ( {email, password}: LogInPayload) => {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for') || 'unknown';

    const rateLimited = await rateLimiter({
        client: client as any,
        userId: `login:${ip}`,
        actionKey: 'login',
        limit: 5,
        windowSizeSecs: 60,
    });

    if (rateLimited) {
        return { success: false, msg: 'Too many login attempts. Please try again later.' };
    }

    const foundUser = await prisma.user.findFirst({
        where: { email },
    });

    if (!foundUser) {
        return { success: false, msg: 'Invalid email or password' };
    }

    const isValid = await bcryptjs.compare(password, foundUser.hash)

    if (!isValid) {
        return { success: false, msg: 'Invalid email or password' };
    }

    await createSession(foundUser.id)
    const { hash, ...user } = foundUser

    return {success: true, msg: 'User logged in successfully', user}
};

export const logIn: (data:LogInPayload)=>  Promise<LogInActionResponse> = withValidation(_logIn, logInSchema)