import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { IUser, User } from '../models/User';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail';

type userToken = { user: IUser; activationCode: string };

export class UserController {
  //Register a new user
  static async register(req: Request, res: Response) {
    const { name, email, password, role, phone } = req.body;
    const userDetails = { name, email, password, role, phone };
    const { activationCode, token } = createActivationToken(userDetails);
    const data = { user: { name: userDetails.name }, activationCode };

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: 'User already exists' });
      }
      await sendMail({
        email: userDetails.email,
        subject: 'Activate your account',
        template: 'activation-mail.ejs',
        data
      });
      res.status(201).json({
        success: true,
        message: `Please check your email: ${userDetails.email} to activate your account!`,
        activationToken: token
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }

  static async activateUser(req: Request, res: Response) {
    const { activation_token, activation_code } = req.body;

    try {
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as userToken;
      if (newUser.activationCode !== activation_code) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activation code'
        });
      }
      const { email, phone, role, password, name } = newUser.user;
      const existUser = await User.findOne({ email });
      if (existUser) {
        return res
          .status(400)
          .json({ success: false, message: 'User already exists' });
      }
      await User.create({
        name,
        phone,
        role,
        password,
        email
      });
      res.status(201).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
       return res.status(400).json({ msg: 'Invalid credentials' });
      }
      const { name, role, phone } = user;

      const payload = {
        userId: user.id,
        user: { id: user.id, name, email, role, phone }
      };
      const token = jwt.sign(payload, process.env.ACTIVATION_SECRET as string, {
        expiresIn: '1h'
      });
      return res.status(200).json({ token });
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('server error');
    }
  }
  static async getUserProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
  static async updateUserProfile(req: Request, res: Response) {
    const { name: newName, email: newEmail, phone: newPhone } = req.body;

    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = newName ?? user.name;
      user.email = newEmail ?? user.email;
      user.phone = newPhone ?? user.phone;

      await user.save();

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
}

interface IActivationToken {
  token: string;
  activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: '5m'
    }
  );

  return { token, activationCode };
};
