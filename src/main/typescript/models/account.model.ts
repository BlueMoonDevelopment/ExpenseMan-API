import mongoose from 'mongoose';
import { account_settings } from '../config.json';

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
    account_expenses: {
        type: Array,
        default: [],
    },
    account_income: {
        type: Array,
        default: [],
    },
});

export const Account = mongoose.model('Account', AccountSchema);