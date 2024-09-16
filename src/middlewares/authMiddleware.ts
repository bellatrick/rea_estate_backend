import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get token from header
  let token = req.header('Authorization');
  //console.log(token);
  // check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Remove 'Bearer ' from the token if it starts with it
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET as string);
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      return res
        .status(401)
        .json({ msg: 'Token is not valid or no user found in token' });
    }
    req.user = decoded.user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
