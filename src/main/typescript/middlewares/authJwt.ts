import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwt_secret } from '../config.json';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.session.accessToken;
    const userId = req.session.userId;

    if (token === undefined || userId === undefined || !token || !userId) {
        return res.status(401).send({ message: 'Unauthorized! Session not found or expired!' });
    }

    jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized! Error: ' + err.name + ': ' + err.message });
        }

        const payload = decoded as JwtPayload;
        if (payload.id != userId) {
            return res.status(401).send({ message: 'Unauthorized! UserID from Session does not match UserID from Payload!' });
        }

        req.body.token_user_id = payload.id;

        next();
    });
};

export const authJwt = {
    verifyToken,
};