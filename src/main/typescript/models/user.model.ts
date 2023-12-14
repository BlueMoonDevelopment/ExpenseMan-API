import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'can\'t be blank'],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
    },
    password: {
        type: String,
        required: false,
    },
});

type IUser = InferSchemaType<typeof UserSchema>;

export const User = mongoose.model<IUser>('User', UserSchema);