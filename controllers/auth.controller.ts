import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { User } from '../models/user.model';
import { jwt_secret } from '../config.json';
import { Request, Response } from 'express';

export const checkUser = (req: Request, res: Response) => {
    User.findOne({ email: req.body.email }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(200).send({ exists: false });
        } else {
            return res.status(200).send({
                exists: true,
                _id: user._id,
            });
        }
    });
};

export const signup = (req: Request, res: Response) => {
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });

    console.log(req.ip);

    user.save((err) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        const token = jwt.sign({ id: user.id }, jwt_secret, {
            // 24 hours
            expiresIn: 86400,
        });
        res.status(200).send({ accessToken: token });
        res.status(200).send({ message: 'User was registered successfully!' });
    });
};

export const signin = (req: Request, res: Response) => {
    console.log(req.ip);

    User.findOne({
        email: req.body.email,
    })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: 'User Not found.' });
            }

            if (!user.password) {
                res.status(500).send({ message: err });
                return;
            }

            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password,
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: 'Invalid Password!',
                });
            }

            const token = jwt.sign({ id: user.id }, jwt_secret, {
                // 24 hours
                expiresIn: 86400,
            });


            res.status(200).send({
                id: user._id,
                email: user.email,
                accessToken: token,
            });
        });
};