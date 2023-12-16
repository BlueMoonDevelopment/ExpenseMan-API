import { Auth } from 'googleapis';
import { google_oauth_client_id, google_oauth_client_secret } from './config.json';
import { Application } from 'express';

const oAuth2Client = new Auth.OAuth2Client({
        clientId: google_oauth_client_id,
        clientSecret: google_oauth_client_secret,
        redirectUri: 'postmessage',
    },
);

export function registerOAuthRoutes(app: Application) {
    app.post('/auth/google', (req, res) => {
        // exchange code for tokens
	console.log(req.headers);
	console.log(req.body);
	console.log('body.code: ' + req.body.code);
	console.log('query.code: ' + req.query.code);
	console.log('body.credential: ' + req.body.credential);
        console.log('query.credential: ' + req.query.credential);
        //const { tokens } = await oAuth2Client.getToken(req.body.code);
        //console.log(tokens);
        //res.json(tokens);
	res.status(200).send();
    });

     app.get('/auth/google', async (req, res) => {
        // exchange code for tokens
	console.log("get");
        console.log(req.query);
        console.log('query.code: ' + req.query.code);
        console.log('query.code: ' + req.query.code);
        console.log('query.code: ' + req.query.code);
        //const { tokens } = await oAuth2Client.getToken(req.body.code);
        //console.log(tokens);
        //res.json(tokens);
        res.status(200).send();
    });


    app.post('/auth/google/refresh-token', async (req, res) => {
        const user = new Auth.UserRefreshClient(
            google_oauth_client_id,
            google_oauth_client_secret,
            req.body.refreshToken,
        );
        // optain new tokens
        const { credentials } = await user.refreshAccessToken();
        res.json(credentials);
    });
}
