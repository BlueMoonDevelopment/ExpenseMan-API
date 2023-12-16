import { Application } from 'express';
import { jwtDecode } from 'jwt-decode';
import jwt from 'jsonwebtoken';

import { User } from './models/user.model';
import { jwt_secret } from './config.json';

export function registerOAuthRoutes(app: Application) {
    // Either sign-in or sign-up and then sign-in
    app.post('/auth/google', async (req, res) => {
        const credential = req.body.credential;
        const tokenFromBody = req.body.g_csrf_token;
        const cookies = req.signedCookies;
        if (credential === undefined) {
            return res.status(502).json({ 'message': 'Credential is undefined!' });
        }

        if (tokenFromBody === undefined) {
            return res.status(502).json({ 'message': 'CSRF Token is undefined!' });
        }


        // ToDo: Check if g_csrf_token COOKIE has same value as the token that comes from the body

        const USER_DATA = JSON.parse(jwtDecode(credential));

        console.log('userID: ' + USER_DATA.sub);
        console.log('Full Name: ' + USER_DATA.name);
        console.log('Given Name: ' + USER_DATA.given_name);
        console.log('Family Name: ' + USER_DATA.family_name);
        console.log('Image URL: ' + USER_DATA.picture);
        console.log('Email: ' + USER_DATA.email);


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
        const user_id = user._id as string;
        req.session.userId = user_id;
        req.session.accessToken = token;

        res.status(200).json({ 'message': 'session was set!' });
    });

    app.get('/auth/google', (req, res) => {
        return res.status(403).json({ 'message': 'no direct access!' });
    });
}
