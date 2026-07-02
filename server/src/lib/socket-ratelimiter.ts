import { Socket } from 'socket.io';

const RATE_LIMIT_PREFIX = 'rl:socket:';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  'send-message':      { limit: 10, windowMs: 10000 },
  'send-typing':       { limit: 5,  windowMs: 2000  },
  'send-stop-typing':  { limit: 5,  windowMs: 2000  },
  'join-room':         { limit: 5,  windowMs: 10000 },
  'leave-room':        { limit: 5,  windowMs: 10000 },
  'leave-room-forever':{ limit: 3,  windowMs: 30000 },
  'find-match':        { limit: 3,  windowMs: 10000 },
  'stop-search':       { limit: 3,  windowMs: 10000 },
  'send-room-invite':  { limit: 3,  windowMs: 30000 },
};

export const checkRateLimit = async (
  client: any,
  socket: Socket,
  eventName: string,
): Promise<boolean> => {
  const config = LIMITS[eventName];
  if (!config) return false;

  const identity = socket.user?.id || socket.id;
  const key = `${RATE_LIMIT_PREFIX}${identity}:${eventName}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    await client.zAdd(key, [{ score: now, value: `${now}` }]);
    await client.zRemRangeByScore(key, 0, windowStart);
    const count = await client.zCard(key);

    if (count > config.limit) {
      await client.zRem(key, `${now}`);
      return true;
    }

    if (count === 1) {
      await client.expire(key, Math.ceil(config.windowMs / 1000));
    }
    return false;
  } catch {
    return true;
  }
};
