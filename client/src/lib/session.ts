import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const secret = rawSecret;

export const createSession = async (userId: string) => {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	// prettier-ignore
	const token = jwt.sign({ userId, expiresAt }, secret, {
		algorithm: 'HS256',
		expiresIn: '7d',
	});

	const cookieStore = await cookies();
	cookieStore.set('SERVER_TOKEN', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: expiresAt,
	});
};

export const verifySession = async (token: string | undefined) => {

	try {
		//! Remember that this expire, they must be replaced every seven days.
		const payload = jwt.verify(token as string, secret, { algorithms: ['HS256'] }) as { userId: string };
		
		return payload.userId as string;
	} catch (e) {

		return null;
	}
};

export const deleteSession = async () => {
	const cookieStore = await cookies();
	cookieStore.delete('SERVER_TOKEN');
};
