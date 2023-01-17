/**
 * Required external modules
 */
import express, { Application } from 'express';
import session from 'express-session';
import ratelimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan, { StreamOptions } from 'morgan';


/**
 * Required internal modules
 */
import { info } from './logmanager';

/**
 * Required configuration sections
 */
import { website_port, session_secret } from './config.json';

/**
 * App Variables
 */
const app: Application = express();
const oneDay = 1000 * 60 * 60 * 24;

const ads = [
    {title: 'Hello, world (again)!'}
  ];

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
    resave: false
}));
app.use(
  ratelimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 calls
  })
);
app.disable("x-powered-by");


app.get('/', (req, res) => {
    res.send(ads);
  });


/**
 * Server Activation
 */
app.listen(website_port, () => {
    info(`Listening to requests at 127.0.0.1:${website_port}`);
});