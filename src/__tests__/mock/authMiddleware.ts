import { Request, Response, NextFunction } from 'express';
import { ExtendedUser } from '../../../@types/custom';

export const mockAuthMiddleware = (user:ExtendedUser) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Inject a mock user object into the request
    req.user = user

    next();
  };
};
