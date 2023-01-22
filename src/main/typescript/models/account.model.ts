import mongoose from 'mongoose';
import { account_settings } from '../config.json';

const AccountSchema = new mongoose.Schema({
    user_id: {
        type: String,
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
    balance: {
        type: Number,
        default: 0,
    },
});

export const Account = mongoose.model('Account', AccountSchema);