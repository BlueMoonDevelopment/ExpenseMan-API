import mongoose from 'mongoose';

const IncomeSchema = new mongoose.Schema({
    income_owner_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    income_account_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    income_name: {
        type: String,
        required: true,
    },
    income_value: {
        type: Number,
        required: true,
    },
    income_category_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    income_desc: {
        type: String,
        default: '',
    },
    income_repeat_cycle: {
        type: Number,
        default: -1,
    },
});

export const Income = mongoose.model('Income', IncomeSchema);