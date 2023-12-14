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
    app.post('/auth/google', async (req, res) => {
        // exchange code for tokens
        const { tokens } = await oAuth2Client.getToken(req.body.code);
        console.log(tokens);
        res.json(tokens);
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