import {Schema,model,Document} from 'mongoose';
import {ITenant} from './Tenant';
import {IProperty} from './Property'

export interface IPayment extends Document {
    tenantId: ITenant['_id'];
    propertyId: IProperty['_id'];
    amount: number;
    paymentDate: Date;
    status?:'pending'|'completed'|'failed';
    receiptUrl?:string;
    createdAt?: Date;
    updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default:"pending" },
    receiptUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Payment = model<IPayment>('Payment', PaymentSchema);