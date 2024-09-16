import { Schema, model, Document } from 'mongoose';
import { IUser } from './User';
import { IProperty } from './Property';
import { IPayment } from './Payment';

export interface ITenant extends Document {
  userId: IUser['_id'];
  landlords?: IUser['_id'][];
  rentedProperties?: IProperty['_id'][];
  paymentHistory?: IPayment['_id'][];
  createdAt?: Date;
  updatedAt?: Date;
  rent?: { propertyId: IProperty['_id']; amount: number }[];
}

const TenantSchema = new Schema<ITenant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landlords: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  rentedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  paymentHistory: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  rent: [
    {
      propertyId: {
        type: Schema.Types.ObjectId,
        ref: 'Property',
        required: true
      },
      amount: { type: Number, required: true }
    }
  ]
});


export const Tenant = model<ITenant>('Tenant', TenantSchema);
