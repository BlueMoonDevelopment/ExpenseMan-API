import { Application } from 'express';
import { jwtDecode } from 'jwt-decode';
import jwt from 'jsonwebtoken';

import { User } from './models/user.model';
import { jwt_secret, frontend_url } from './config.json';
import { authJwt } from './middlewares/authJwt';
import { debug } from './tools/logmanager';

export function registerOAuthRoutes(app: Application) {
    // Either sign-in or sign-up and then sign-in
    app.post('/auth/google', async (req, res) => {
        const credential = req.body.credential;
        const tokenFromBody = req.body.g_csrf_token;
        const cookies = req.signedCookies;
        if (credential === undefined) {
            return res.redirect(frontend_url + '/auth/failed');
        }

        if (tokenFromBody === undefined) {
            return res.redirect(frontend_url + '/auth/failed');
        }


        // ToDo: Check if g_csrf_token COOKIE has same value as the token that comes from the body

        const USER_DATA = jwtDecode(credential);

        let user = await User.findOne({ email: USER_DATA.email, sub: USER_DATA.sub }).exec();
        if (!user || !user.password) {
            // Register new user
            user = new User({
                email: USER_DATA.email,
                sub: USER_DATA.sub,
            });
            await user.save();
        }


        const token = jwt.sign({ id: user.id }, jwt_secret, {
            // 24 hours
            expiresIn: 86400,
        });
        req.session.userId = user._id as string;
        req.session.accessToken = token;
        return res.redirect(frontend_url + '/auth/success');
    });

    app.get('/auth/google', (req, res) => {
        return res.status(403).json({ 'message': 'no direct access!' });
    });

    app.get('/auth/checksignedin', authJwt.verifyToken, (req, res) => {
        debug('user is signed in');
        return res.status(200).send();
    });
}
