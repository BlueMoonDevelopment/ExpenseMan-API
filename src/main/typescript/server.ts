/**
 * Required external modules
 */
import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import morgan from 'morgan';
import cookies from 'cookie-parser';

/**
 * Required internal modules
 */
import { info, errorWithError } from './tools/logmanager';
import { registerSwaggerUI } from './swaggerhelper';

/**
 * Required routes
 */
import { registerAccountRoutes } from './routes/accounts.routes';
import { registerCategoryRoutes } from './routes/categories.routes';
import { registerIncomeRoutes } from './routes/income.routes';
import { registerExpenseRoutes } from './routes/expense.routes';
import { registerOAuthRoutes } from './oauthhelper';

/**
 * Required configuration sections
 */
import { server_settings, database_settings, security_settings } from './config.json';

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
mongoose.connect(database_settings.mongodb_auth_url).then(() => info('Connected to mongodb')).catch((err) => errorWithError('Error connecting to mongodb', err));

/**
 * App Configuration
 */
app.use(cors({
    origin: server_settings.frontend_url,
    credentials: true,
}));
app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: security_settings.session_secret,
    cookie: {
        maxAge: oneDay,
        sameSite: server_settings.development_mode ? 'lax' : 'none',
        secure: !server_settings.development_mode,
    },
}));

app.use(morgan('combined'));
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

declare module 'jwt-decode' {
    interface JwtPayload {
        email: string | undefined;
    }
}

/**
 * Route definitions
 */
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
app.listen(server_settings.website_port, () => {
    info(`Listening to requests at Port ${server_settings.website_port}. 
    Development mode: ${server_settings.development_mode}
    Frontend-URL: ${server_settings.frontend_url}`);
});
