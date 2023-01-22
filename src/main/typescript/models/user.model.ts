import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'can\'t be blank'],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
    },
    password: String,
});

export const User = mongoose.model('User', UserSchema);