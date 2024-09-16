import { Router } from 'express';
import { check } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRouter = Router();

userRouter.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['landlord', 'tenant'])
  ],
  UserController.register
);

userRouter.post('/activate', UserController.activateUser);

userRouter.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  UserController.login
);

userRouter.get(
  '/profile/:userId',
  authMiddleware,
  UserController.getUserProfile
);

userRouter.put(
  '/profile/:userId',
  authMiddleware,
  UserController.updateUserProfile
);

export default userRouter;
