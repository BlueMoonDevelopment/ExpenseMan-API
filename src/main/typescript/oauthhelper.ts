import { Application } from 'express';
import { jwtDecode } from 'jwt-decode';


export function registerOAuthRoutes(app: Application) {
    app.post('/auth/google', (req, res) => {
        const credential = req.body.credential;
        const USER_CREDENTIAL = jwtDecode(credential);
        res.status(200).json(USER_CREDENTIAL);
    });

}
