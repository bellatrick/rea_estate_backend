import {Schema,model,Document} from 'mongoose';
import { ILandlord } from "./Landlord";
import { IProperty } from "./Property";

export interface IExpense extends Document {
    landlordId: ILandlord['_id'];
    propertyId: IProperty['_id'];
    description: string;
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
    date:Date
}

const ExpenseSchema = new Schema<IExpense>({
    landlordId: { type: Schema.Types.ObjectId, ref: 'Landlord', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    date:{type:Date,required:true}
});

export const Expense =model<IExpense>('Expense',ExpenseSchema);