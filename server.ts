/**
 * Required external modules
 */
import express, { Application } from 'express';
import session from 'express-session';
import ratelimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

/**
 * Required internal modules
 */
import { info, errorWithError } from './logmanager';
import { register } from './swaggerhelper';
import { registerUserRoutes } from './routes/user.routes';
import { registerAuthRoutes } from './routes/auth.routes';
import { router } from './routes/products.routes';

/**
 * Required configuration sections
 */
import {
  website_port,
  session_secret,
  mongodb_auth_url,
} from './config/config.json';

/**
 * App Variables
 */
const app: Application = express();

/**
 * Database connection
 */
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(mongodb_auth_url, { keepAlive: true, keepAliveInitialDelay: 300000 }).then(() => info('Connected to mongodb')).catch((err) => errorWithError('Error connecting to mongodb', err));

/**
 * App Configuration
 */
app.disable('x-powered-by');
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: session_secret,
  saveUninitialized: false,
  cookie: { maxAge: 60000 },
  resave: false,
}));
app.use(
  ratelimit({
    // 1 minute
    windowMs: 60 * 1000,
    // 60 calls
    max: 60,
  })
);

/**
 * Route definitions
 */
app.use('/products', router);

registerAuthRoutes(app);
registerUserRoutes(app);
register(app);

app.use('*', (req, res) => {
  res.send('404 Not found');
});


/**
 * Server Activation
 */
app.listen(website_port, () => {
  info(`Listening to requests at 127.0.0.1:${website_port}`);
});