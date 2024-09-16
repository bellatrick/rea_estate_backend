import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import userRouter from './routes/user.route';
import { setupSwagger } from './utils/swagger';
import { connectToDB } from './db';
import landlordRouter from './routes/landlord.route';
import TenantRouter from './routes/tenant.route';
import PropertyRouter from './routes/property.route';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '10mb' }));

setupSwagger(app);
app.use('/api/v1', userRouter, landlordRouter, TenantRouter, PropertyRouter);

connectToDB();

app.listen(PORT, () => {
  console.log('server is running on port', PORT);
});
