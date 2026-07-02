import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'

export const GET = async (NextRequest: NextRequest) => {
    const imageName = NextRequest.nextUrl.searchParams.get('imagename');

    
    if (!imageName) {
        return NextResponse.json(
            {
                success: false,
                error: 'Missing "imageName" query parameter.',
            },
            { status: 400 }
        );
    }

    const sanitizedImageName = path.basename(imageName);
    const imagePath = path.join('media', 'profile-pics', sanitizedImageName);
    const imageMimeType = mime.getType(sanitizedImageName) || 'application/octet-stream'

    try{
        const stream = fs.createReadStream(imagePath)

        return new NextResponse(stream as any, {
            headers: {
                'Content-type': imageMimeType
            }
        })

    }catch(e){
        return NextResponse.json(
            { success: false, error: 'Image not found.' },
            { status: 404 }
        );
    }
};
