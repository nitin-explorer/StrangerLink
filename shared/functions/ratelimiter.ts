import { RedisClientType } from 'redis';
import { rateLimitKey } from '../keys/user-keys';

const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local windowStart = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local windowSizeSecs = tonumber(ARGV[4])
  redis.call('zRemRangeByScore', key, 0, windowStart)
  local count = redis.call('zCard', key)
  if count >= limit then
    return 1
  end
  redis.call('zAdd', key, now, 'req-' .. now)
  redis.call('expire', key, windowSizeSecs)
  return 0
`;

export const rateLimiter = async ({
	client,
    userId,
	actionKey,
	limit,
	windowSizeSecs,
}: {
	client: RedisClientType;
    userId: string;
	actionKey: string;
	limit: number;
	windowSizeSecs: number;
}) => {
	const key = rateLimitKey(userId, actionKey);
    const now = Date.now();
    const windowStart = now - windowSizeSecs * 1000;

  try {
    const blocked = await client.eval(RATE_LIMIT_SCRIPT, {
      keys: [key],
      arguments: [String(now), String(windowStart), String(limit), String(windowSizeSecs)],
    });
    return blocked === 1;
  } catch {
    return true;
  }
};
