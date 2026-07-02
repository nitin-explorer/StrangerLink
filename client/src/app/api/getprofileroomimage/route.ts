import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'

const ALLOWED_IMAGE_TYPES = ['profile-pics', 'room-pics'];

export const GET = async (NextRequest: NextRequest) => {
    const token = NextRequest.cookies.get('SERVER_TOKEN')?.value;
    const { verifySession } = await import('@/lib/session');
    const userId = await verifySession(token);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const imageName = NextRequest.nextUrl.searchParams.get('imagename');
    const imageType = NextRequest.nextUrl.searchParams.get('type')

    if (!imageName) {
        return NextResponse.json(
            {
                success: false,
                error: 'Missing "imageName" query parameter.',
            },
            { status: 400 }
        );
    }

    if (!imageType || !ALLOWED_IMAGE_TYPES.includes(imageType)) {
        return NextResponse.json(
            {
                success: false,
                error: 'Missing or invalid "type" query parameter.',
            },
            { status: 400 }
        );
    }

    const sanitizedImageName = path.basename(imageName);
    const imagePath = path.join('media', imageType, sanitizedImageName);
    const imageMimeType = mime.getType(sanitizedImageName) || 'application/octet-stream'

    const resolvedPath = path.resolve(imagePath);
    if (!resolvedPath.startsWith(path.resolve('media'))) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
    }

    try{
        const stream = fs.createReadStream(resolvedPath)

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
