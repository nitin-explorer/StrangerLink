import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import getsessioninfoRouter from './routes/getsessioninfo.js';
const app = express();



const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cookieParser())
app.use(cors({origin: corsOrigin, credentials: true}));
app.use(express.json({ limit: '10mb' }));
app.use(getsessioninfoRouter);


export default app
