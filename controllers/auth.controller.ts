import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { User } from '../models/user.model';
import { jwt_secret } from '../config.json';
import { Request, Response } from 'express';

export const checkUser = (req: Request, res: Response) => {
    User.findOne({ email: req.body.email }).exec((err, user) => {
        if (err) {
            res.send({ message: err });
            return;
        }

        if (!user) {
            return res.send({ exists: false });
        } else {
            return res.send({
                exists: true,
                _id: user._id,
            });
        }
    });
};

export const checkToken = (req: Request, res: Response) => {
    const id = req.body.id;
    const tok = req.body.accessToken;

    User.findById(id).exec((err, user) => {
        if (err) {
            res.send({ message: 'User does not exist' });
            return;
        }

        if (user && jwt.verify(tok, jwt_secret)) {
            res.send({ matching: true });
        } else {
            res.send({ matching: false });
        }
    });

};

export const signup = (req: Request, res: Response) => {
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });

    user.save((err) => {
        if (err) {
            res.send({ message: err });
            return;
        }

        const token = jwt.sign({ id: user.id }, jwt_secret, {
            // 24 hours
            expiresIn: 86400,
        });
        res.send({ accessToken: token, id: user.id });
    });
};

export const signin = (req: Request, res: Response) => {
    User.findOne({
        email: req.body.email,
    })
        .exec((err, user) => {
            if (err) {
                res.send({ message: err });
                return;
            }

            if (!user) {
                return res.send({ message: 'User Not found.' });
            }

            if (!user.password) {
                res.send({ message: err });
                return;
            }

            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password,
            );

            if (!passwordIsValid) {
                return res.send({
                    message: 'Invalid Password!',
                });
            }

            const token = jwt.sign({ id: user.id }, jwt_secret, {
                // 24 hours
                expiresIn: 86400,
            });


            res.send({
                id: user._id,
                email: user.email,
                accessToken: token,
            });
        });
};