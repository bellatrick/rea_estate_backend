import { Request } from 'express';
import { IUser } from '../src/models/User';

interface ExtendedUser extends IUser {
  id?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ExtendedUser;
      userId: string;
    }
  }
}
