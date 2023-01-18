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

import { router } from './routes/products';


/**
 * Required internal modules
 */
import { info, errorWithError } from './logmanager';

/**
 * Required configuration sections
 */
import { website_port, session_secret, mongodb_auth_url } from './config.json';

/**
 * App Variables
 */
const app: Application = express();
const oneDay = 1000 * 60 * 60 * 24;

const ads = [
  { title: 'Hello, world (again)!' },
];

/**
 * Database connection
 */

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(mongodb_auth_url).then(() => info('Connected to mongodb')).catch((err) => errorWithError('Error connecting to mongodb', err));

/**
 * App Configuration
 */
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));
app.use(session({
  secret: session_secret,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
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
app.disable('x-powered-by');


app.get('/', (req, res) => {
  res.send(ads);
});

app.use('/products', router);


/**
 * Server Activation
 */
app.listen(website_port, () => {
  info(`Listening to requests at 127.0.0.1:${website_port}`);
});