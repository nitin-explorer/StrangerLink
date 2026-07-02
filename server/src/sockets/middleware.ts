
import * as cookie from 'cookie';

import { Socket } from 'socket.io';
import { prisma } from 'src/lib/db.js';
import { verifyToken } from 'src/lib/tokens.js';

const connectionCounts = new Map<string, { count: number; resetAt: number }>();
const CONNECTION_LIMIT = 20;
const CONNECTION_WINDOW_MS = 60000;

const cleanupInterval = setInterval(() => {
	const now = Date.now();
	for (const [ip, entry] of connectionCounts) {
		if (now > entry.resetAt) connectionCounts.delete(ip);
	}
}, 60000);
cleanupInterval.unref();

const checkConnectionRate = (socket: Socket): boolean => {
	const ip = socket.handshake.address;
	const now = Date.now();
	const entry = connectionCounts.get(ip);

	if (!entry || now > entry.resetAt) {
		connectionCounts.set(ip, { count: 1, resetAt: now + CONNECTION_WINDOW_MS });
		return true;
	}

	if (entry.count >= CONNECTION_LIMIT) {
		return false;
	}

	entry.count++;
	return true;
};

const parseToken = (socket: Socket): string | null => {
	const rawCookie = socket.handshake.headers.cookie || '';
	const parsedCookies = cookie.parse(rawCookie);
	return parsedCookies['SERVER_TOKEN'] || null;
};

const authenticateSocketStrict = async ( socket: Socket, next: (err?: Error) => void) => {
	if (!checkConnectionRate(socket)) {
		next(new Error('Too many connection attempts. Please slow down.'));
		return;
	}

	const token = parseToken(socket);
	if (!token) {
		next(new Error('Authentication required'));
		return;
	}

	const decoded = verifyToken(token);
	if (!decoded) {
		next(new Error('Invalid token'));
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: decoded },
			select: {
				email: true,
				id: true,
				username: true,
			},
		});

		if (!user) {
			next(new Error('User not found'));
			return;
		}

		socket.user = user;
		next();
	} catch (err) {
		console.error('Auth error:', err);
		next(new Error('Authentication service unavailable'));
	}
};

const authenticateSocketOptional = async ( socket: Socket, next: (err?: Error) => void) => {
	if (!checkConnectionRate(socket)) {
		next(new Error('Too many connection attempts. Please slow down.'));
		return;
	}

	const token = parseToken(socket);
	if (!token) {
		socket.user = null;
		next();
		return;
	}

	const decoded = verifyToken(token);
	if (!decoded) {
		socket.user = null;
		next();
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: decoded },
			select: {
				email: true,
				id: true,
				username: true,
			},
		});

		if (!user) {
			socket.user = null;
			next();
			return;
		}

		socket.user = user;
		next();
	} catch (err) {
		console.error('Optional auth error:', err);
		socket.user = null;
		next();
	}
};

export const middleWare = authenticateSocketOptional;
export const strictAuthMiddleware = authenticateSocketStrict;
