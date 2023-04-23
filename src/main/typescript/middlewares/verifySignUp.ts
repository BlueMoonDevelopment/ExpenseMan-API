import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
import sanitize from 'mongo-sanitize';

const checkDuplicateEmail = async (req: Request, res: Response, next: NextFunction) => {
    // Email
    const user = await User.findOne({ email: sanitize(req.body.email) }).exec();
    try {
        if (user) {
            res.status(409).send({ message: 'Failed! Email is already in use!' });
            return;
        }

        next();
    } catch (err) {
        res.status(500).send({ message: err });
        return;
    }

};

export const verifySignUp = {
    checkDuplicateEmail,
};