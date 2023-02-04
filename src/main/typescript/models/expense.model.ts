import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
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
    expense_desc: {
        type: String,
        default: '',
    },
    expense_repeat_cycle: {
        type: Number,
        default: -1,
    }
});

export const Expense = mongoose.model('Expense', ExpenseSchema);