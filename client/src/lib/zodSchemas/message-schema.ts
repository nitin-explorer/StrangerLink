import { z } from 'zod'

export const messageSchema = z.object({
    message: z.string().min(1).max(2000),
    roomId: z.string(),
})