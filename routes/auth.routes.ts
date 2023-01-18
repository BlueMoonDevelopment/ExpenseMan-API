import { signup, signin } from '../controllers/auth.controller';
import { verifySignUp } from '../middlewares/verifySignUp';
import { Application } from 'express';

export function registerAuthRoutes(app: Application) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.post(
        '/auth/signup',
        [
            verifySignUp.checkDuplicateEmail,
        ],
        signup
    );

    app.post('/auth/signin', signin);
}