import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'

export const GET = async (NextRequest: NextRequest) => {
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
	const fileMimeType = mime.getType(sanitizedFileName) || 'application/octet-stream'

	try{
        const stream = fs.createReadStream(filePath)

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
