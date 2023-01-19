import { signup, signin } from '../controllers/auth.controller';
import { verifySignUp } from '../middlewares/verifySignUp';
import { Application } from 'express';

function registerAuthSignup(app: Application) {
    app.post('/auth/signup', verifySignUp.checkDuplicateEmail, signup);
}

function registerAuthSignIn(app: Application) {
    app.post('/auth/signin', signin);
}

export function registerAuthRoutes(app: Application) {
    registerAuthSignup(app);
    registerAuthSignIn(app);
}