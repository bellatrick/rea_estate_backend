import { Schema, model, Document } from 'mongoose';
import { ILandlord } from './Landlord';
import { ITenant } from './Tenant';

export interface IProperty extends Document {
  landlordId: ILandlord['_id'];
  address: string;
  name:string;
  description: string;
  images?: string[];
  rentalTerms: string;
  currentTenantId?: ITenant['_id'];
  createdAt?: Date;
  updatedAt?: Date;
}

const PropertySchema = new Schema<IProperty>({
  landlordId: { type: Schema.Types.ObjectId, ref: 'Landlord', required: true },
  address: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  rentalTerms: { type: String, required: true },
  currentTenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Property = model<IProperty>('Property', PropertySchema);
