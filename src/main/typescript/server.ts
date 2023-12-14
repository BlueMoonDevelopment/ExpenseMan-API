/**
 * Required external modules
 */
import express, { Application } from 'express';
import ratelimit from 'express-rate-limit';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';

/**
 * Required internal modules
 */
import { info, errorWithError } from './tools/logmanager';
import { registerSwaggerUI } from './swaggerhelper';

/**
 * Required routes
 */
import { registerAuthRoutes } from './routes/auth.routes';
import { registerAccountRoutes } from './routes/accounts.routes';
import { registerCategoryRoutes } from './routes/categories.routes';
import { registerIncomeRoutes } from './routes/income.routes';
import { registerExpenseRoutes } from './routes/expense.routes';
import { registerOAuthRoutes } from './oauthhelper';

/**
 * Required configuration sections
 */
import { website_port, mongodb_auth_url, session_secret, frontend_url, development_mode } from './config.json';

/**
 * App Variables
 */
const app: Application = express();
const oneDay = 1000 * 60 * 60 * 24;

declare module 'express-session' {
    interface Session {
        userId: string;
        accessToken: string;
    }
}

/**
 * Database connection
 */
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(mongodb_auth_url).then(() => info('Connected to mongodb')).catch((err) => errorWithError('Error connecting to mongodb', err));

/**
 * App Configuration
 */
app.use(cors({
    origin: frontend_url,
    credentials: true,
}));
app.use(express.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: session_secret,
    cookie: {
        maxAge: oneDay,
        sameSite: development_mode ? 'lax' : 'none',
        secure: !development_mode,
    },
}));

app.use(ratelimit({ windowMs: 60 * 1000, max: 60 }));
app.use(express.static(__dirname + '/public'));
app.set('trust proxy', true);


// Setup header to allow access-token
app.use(function (req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'x-access-token, Origin, Content-Type, Accept',
    );
    next();
});

/**
 * Type definitions
 */
declare module 'jsonwebtoken' {
    interface JwtPayload {
        id: string;
    }
}

/**
 * Route definitions
 */
registerAuthRoutes(app);
registerAccountRoutes(app);
registerCategoryRoutes(app);
registerIncomeRoutes(app);
registerExpenseRoutes(app);
registerOAuthRoutes(app);

registerSwaggerUI(app);

// 404 Error, has to be called last (after all other pages)
app.use(function (req, res) {
    res.status(404).send('404 Not found');
});

/**
 * Server Activation
 */
app.listen(website_port, () => {
    info(`Listening to requests at Port ${website_port}. 
    Development mode: ${development_mode}
    Frontend-URL: ${frontend_url}`);
});