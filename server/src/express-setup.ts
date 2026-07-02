import express from 'express';
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import getsessioninfoRouter from './routes/getsessioninfo.js';
const app = express();



const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(helmet())
app.use(cookieParser())
app.use(cors({origin: corsOrigin, credentials: true}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(getsessioninfoRouter);


export default app
