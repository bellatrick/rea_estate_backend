import { Schema, model, Document } from 'mongoose';
import { ITenant } from './Tenant';
import { IProperty } from './Property';
import { ILandlord } from './Landlord';

export interface IMaintenanceRequest extends Document {
  tenantId: ITenant['_id'];
  propertyId: IProperty['_id'];
  landlordId?: ILandlord['_id'];
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt?: Date;
  updatedAt?: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  landlordId:{type:Schema.Types.ObjectId,ref:'Landlord'},
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const MaintenanceRequest = model<IMaintenanceRequest>(
  'MaintenanceRequest',
  MaintenanceRequestSchema
);
