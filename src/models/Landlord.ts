import {Schema,model,Document} from 'mongoose';
import {IUser} from './User';

export interface ILandlord extends Document {
    userId: IUser['_id'];
    companyName: string;
    properties?:string[];
    createdAt?: Date;
    updatedAt?: Date;
}

const LandlordSchema = new Schema<ILandlord>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    properties: [{type:Schema.Types.ObjectId,ref:'Property'}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Landlord = model<ILandlord>('Landlord', LandlordSchema);