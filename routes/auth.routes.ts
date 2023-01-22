import { signup, signin, checkUser, checkToken } from '../controllers/auth.controller';
import { verifySignUp } from '../middlewares/verifySignUp';
import { Application } from 'express';

function registerAuthSignup(app: Application) {
    app.post('/auth/signup', verifySignUp.checkDuplicateEmail, signup);
    app.get('/auth/signup', (req, res) => {
        res.status(405).send({ message: 'Not accessable through browser!' });
    });
}

function registerAuthSignIn(app: Application) {
    app.post('/auth/signin', signin);
    app.get('/auth/signin', (req, res) => {
        res.status(405).send({ message: 'Not accessable through browser!' });
    });
}

function registerCheckUser(app: Application) {
    app.post('/auth/checkuser', checkUser);
    app.get('/auth/checkuser', (req, res) => {
        res.status(405).send({ message: 'Not accessable through browser!' });
    });
}

function registerCheckTokenAndId(app: Application) {
    app.post('/auth/checktoken', checkToken);
    app.get('/auth/checktoken', (req, res) => {
        res.status(405).send({ message: 'Not accessable through browser!' });
    });
}

export function registerAuthRoutes(app: Application) {
    registerAuthSignup(app);
    registerAuthSignIn(app);
    registerCheckUser(app);
    registerCheckTokenAndId(app);
}