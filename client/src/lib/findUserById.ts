import { prisma } from "@/lib/db";

export const findUserById = async (userId: string) => {

    
    if (!userId) {
        return null;
    }
    
    const userInfo = await prisma.user.findFirst({
        where : {
            id: userId
        },
        select: {
            id: true,
            username: true,
            email: true,
            profilePicPath: true,
            country: true,
            gender: true,
            bio: true,
        }
    })
    
    if (!userInfo) {
        //! DO NOT DELETE THE COOKIE HERE BECAUSE THE LAYOUT RENDERING CANNOT HANDLE THAT
        return null;
    }

    return userInfo
}
