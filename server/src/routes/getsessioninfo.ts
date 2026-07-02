import { Router } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { prisma } from '../lib/db.js';

const router = Router();

router.get('/api/getsessioninfo', async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies['SERVER_TOKEN'];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.json({ message: 'success', data: user });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
