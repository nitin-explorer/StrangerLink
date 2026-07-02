import { RedisClientType } from 'redis';
import { rateLimitKey } from '../keys/user-keys';

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

    const  windowStart = now - windowSizeSecs * 1000;

    await client.zAdd(key, [{score: now, value: `req-${now}`}]);

    await client.zRemRangeByScore(key, 0, windowStart);

    const count = await client.zCard(key)

    if (count > limit) {
        await client.zRem(key, `req-${now}`);
        await client.expire(key, windowSizeSecs);
        return true;
    }

    await client.expire(key, windowSizeSecs);

	return false;
};
