import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ILandlord } from './Landlord';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'landlord' | 'tenant';
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword: (password: string) => Promise<boolean>;
  SignRefreshToken: () => string;
  SignAccessToken: () => string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['landlord', 'tenant'], required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
    expiresIn: '5m'
  });
};

UserSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACTIVATION_SECRET || '', {
    expiresIn: '3d'
  });
};

UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};
export const User = model<IUser>('User', UserSchema);
