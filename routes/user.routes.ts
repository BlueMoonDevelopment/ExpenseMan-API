import { authJwt } from '../middlewares/authJwt';
import { Application, Request, Response } from 'express';

export function registerUserRoutes(app: Application) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.get('/test/all', (req: Request, res: Response) => {
        res.status(200).send('Public content');
    });

    app.get('/test/user', authJwt.verifyToken, (req: Request, res: Response) => {
        res.status(200).send('User content');
    });

}