/**
 * Required external modules
 */
import express, { Application } from 'express';
import ratelimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

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

/**
 * Required configuration sections
 */
import { website_port, mongodb_auth_url } from './config.json';

/**
 * App Variables
 */
const app: Application = express();
export const rootPath = __dirname;

/**
 * Database connection
 */
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(mongodb_auth_url, {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
}).then(() => info('Connected to mongodb')).catch((err) => errorWithError('Error connecting to mongodb', err));

/**
 * App Configuration
 */
app.disable('x-powered-by');
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
app.use(morgan('combined'));
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

registerSwaggerUI(app);

// 404 Error, has to be called last (after all other pages)
app.use(function (req, res) {
    res.status(404).send('404 Not found');
});


/**
 * Server Activation
 */
app.listen(website_port, () => {
    info(`Listening to requests at 127.0.0.1:${website_port}`);
});