import jwt from 'jsonwebtoken';

export const verifyToken = (token: string): string | null => {
	
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
		return payload.userId;
	} catch (e) {
		return null;
	}
};
