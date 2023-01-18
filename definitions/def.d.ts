import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface IGetUserIdRequest extends Request {
    userId: string
}

export interface IgetJwtPayload extends JwtPayload {
    id: string
}