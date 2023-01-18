import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { jwt_secret } from '../config.json';

const UserSchema = new mongoose.Schema({
    email: { type: String, lowercase: true, unique: true, required: [true, 'can\'t be blank'], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
    hash: String,
    salt: String,
});


UserSchema.plugin(uniqueValidator, { message: 'is already taken' });


UserSchema.methods.setPassword = function (password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function (password: string) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: (exp.getTime() / 1000),
    }, jwt_secret);
};

UserSchema.methods.toAuthJSON = function () {
    return {
        email: this.email,
        token: this.generateJWT(),
    };
};

export const User = mongoose.model('User', UserSchema);
