import { Schema, model, Document } from 'mongoose';
import { IUser } from './User';

export interface INotification extends Document {
  userId: IUser['_id'];
  message: string;
  type: 'rentDue' | 'maintenance' | 'general';
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message:{type:String,required:true},
  type:{type:String,enum:['rentDue','maintenance','general'],required:true},
  isRead:{type:Boolean,required:true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Notification = model<INotification>('Notification', NotificationSchema);