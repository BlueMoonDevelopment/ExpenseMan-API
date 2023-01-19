import { authJwt } from '../middlewares/authJwt';
import { Application, Request, Response } from 'express';

function registerAllTest(app: Application) {
    app.get('/test/all', (req: Request, res: Response) => {
        res.status(200).send('Public content');
    });
}

function registerUserTest(app: Application) {
    app.get('/test/user', authJwt.verifyToken, (req: Request, res: Response) => {
        res.status(200).send('User content');
    });
}

export function registerUserRoutes(app: Application) {
    registerAllTest(app);
    registerUserTest(app);
}