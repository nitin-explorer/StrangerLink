import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'
import { verifySession } from '@/lib/session';

export const GET = async (NextRequest: NextRequest) => {
	const token = NextRequest.cookies.get('SERVER_TOKEN')?.value;
	const userId = await verifySession(token);
	if (!userId) {
		return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const fileName = NextRequest.nextUrl.searchParams.get('filename');

	if (!fileName) {
		return NextResponse.json(
			{
				success: false,
				error: 'Missing "filepath" query parameter.',
			},
			{ status: 400 }
		);
	}

	const sanitizedFileName = path.basename(fileName);
	const filePath = path.join('media/message-files', sanitizedFileName);
	const resolvedPath = path.resolve(filePath);
	if (!resolvedPath.startsWith(path.resolve('media'))) {
	  return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
	}
	const fileMimeType = mime.getType(sanitizedFileName) || 'application/octet-stream'

	try{
        const stream = fs.createReadStream(resolvedPath)

        return new NextResponse(stream as any, {
            headers: {
                'Content-type': fileMimeType
            }
        })

    }catch(e){
        return NextResponse.json(
            { success: false, error: 'File not found.' },
            { status: 404 }
        );
    }
};
