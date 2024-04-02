import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { security_settings } from '../../json/config.json';
import { debug } from '../tools/logmanager';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.session.accessToken;
    const userId = req.session.userId;

    debug('Token: ' + token);
    debug('Cookie headers: ' + req.headers.cookie);
    debug('Origin headers: ' + req.headers.origin);

    if (token === undefined || userId === undefined || !token || !userId) {
        return res.status(401).send({ message: 'Unauthorized!' });
    }

    jwt.verify(token, security_settings.jwt_secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }

        const payload = decoded as JwtPayload;
        if (payload.id != userId) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        next();
    });
};

export const authJwt = {
    verifyToken,
};