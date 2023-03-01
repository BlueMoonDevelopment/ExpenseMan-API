import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    expense_owner_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    expense_account_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    expense_name: {
        type: String,
        required: true,
    },
    expense_value: {
        type: Number,
        required: true,
    },
    expense_category_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    expense_desc: {
        type: String,
        default: '',
    },
    expense_target_day: {
        type: Number,
        default: -1,
    },
});

export const expense = mongoose.model('expense', expenseSchema);