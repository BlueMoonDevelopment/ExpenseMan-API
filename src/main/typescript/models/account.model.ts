import mongoose, { InferSchemaType } from 'mongoose';
import { account_settings } from '../../json/config.json';

const AccountSchema = new mongoose.Schema({
    account_owner_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    account_name: {
        type: String,
        required: true,
    },
    account_currency: {
        type: String,
        default: account_settings.default_account_currency,
    },
    account_desc: {
        type: String,
        default: '',
    },
    account_balance: {
        type: Number,
        default: 0,
    },
    account_expenses: [],
    account_income: [],
});

type IAccount = InferSchemaType<typeof AccountSchema>;
export const Account = mongoose.model<IAccount>('Account', AccountSchema);