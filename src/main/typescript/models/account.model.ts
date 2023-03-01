import mongoose from 'mongoose';
import { account_settings } from '../config.json';
import { Expense } from './expense.model';
import { Income } from './income.model';

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

export const Account = mongoose.model('Account', AccountSchema);