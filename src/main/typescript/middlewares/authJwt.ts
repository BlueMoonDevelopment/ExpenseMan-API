import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwt_secret } from '../config.json';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-access-token'] as string;

    if (!token) {
        return res.status(401).send({ message: 'No token provided!' });
    }

    jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }

        const payload = decoded as JwtPayload;
        req.body.token_user_id = payload.id;
        next();
    });
};

export const authJwt = {
    verifyToken,
};