import mongoose from 'mongoose';

export const AccountSchema = new mongoose.Schema({
    user_id: String,
    account_name: String,
    account_currency: String,
    account_desc: String,
    balance: Number,
    updated_at: { type: Date, default: Date.now },
});