import { Application } from 'express';
import { jwtDecode } from 'jwt-decode';


export function registerOAuthRoutes(app: Application) {
    app.post('/auth/google', (req, res) => {
        const credential = req.body.credential;
        if (credential === undefined) {
            res.status(502).json({ 'message': 'Credential is undefined!' });
        } else {
            const tokenFromBody = req.body.g_csrf_token;
            const cookies = req.signedCookies;

            // ToDo: Check if g_csrf_token COOKIE has same value as the token that comes from the body
            
            const USER_DATA = JSON.parse(jwtDecode(credential));

            console.log('userID: ' + USER_DATA.sub);
            console.log('Full Name: ' + USER_DATA.name);
            console.log('Given Name: ' + USER_DATA.given_name);
            console.log('Family Name: ' + USER_DATA.family_name);
            console.log('Image URL: ' + USER_DATA.picture);
            console.log('Email: ' + USER_DATA.email);
            res.status(200).json(USER_DATA);
        }
    });

}
