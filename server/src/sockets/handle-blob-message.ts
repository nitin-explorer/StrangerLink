import { z, ZodError } from 'zod';

const imageSchema = z.object({
    size: z.number().min(1).max(4 * 100 * 1024),
    type: z.string().startsWith('image/'),
    fileName: z.string().min(1),
});



export const handleBlobMessage = ( payload: ClientPrivateFileMessageWhenReceived)=>{

    try {
        imageSchema.parse({
            size: payload.bytes?.length || 0,
            type: payload.fileType,
            fileName: payload.fileName,
        });
        return {success: true, message: 'success'}

    } catch (e) {
        console.error(e)
        if (e instanceof ZodError) {
            const errorMessages = e.issues.map((issue) => issue.message);
            const msg = errorMessages[0] || 'Invalid file';
            return {success: false, message: msg};
        }
        
        return {success: false, message: 'Invalid file.'}
    }
}