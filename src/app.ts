import express, { Application } from 'express';
import { userRouter, postRouter } from './components';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);

export default app;

