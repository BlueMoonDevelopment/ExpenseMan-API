import { signup, signin } from '../controllers/auth.controller';
import { verifySignUp } from '../middlewares/verifySignUp';
import { Application } from 'express';

function registerAuthSignup(app: Application) {
    app.post('/auth/signup', verifySignUp.checkDuplicateEmail, signup);
    app.get('/auth/signup', (req, res) => {
        res.status(403).send({ message: 'Not accessable through browser!' });
    });
}

function registerAuthSignIn(app: Application) {
    app.post('/auth/signin', signin);
    app.get('/auth/signin', (req, res) => {
        res.status(403).send({ message: 'Not accessable through browser!' });
    });
}

export function registerAuthRoutes(app: Application) {
    registerAuthSignup(app);
    registerAuthSignIn(app);
}