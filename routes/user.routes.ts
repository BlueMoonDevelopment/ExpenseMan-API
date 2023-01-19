import { authJwt } from '../middlewares/authJwt';
import { Application, Request, Response } from 'express';

/**
 * @swagger
 * /test/all:
 *   get:
 *     tags:
 *     - "User system test"
 *     description: "Will always be accessable for every user"
 *     summary: "Will be deleted later on"
 *     operationId: test_all_users
 *     responses:
 *       '200':
 *         description: "Successful response"
 */
function registerAllTest(app: Application) {
    app.get('/test/all', (req: Request, res: Response) => {
        res.status(200).send('Public content');
    });
}

/**
 * @swagger
 * /test/user:
 *   get:
 *     tags:
 *     - "User system test"
 *     description: "Will only be accessable when an auth key is provided"
 *     summary: "Will be deleted later on"
 *     operationId: test_loggedin_users
 *     parameters:
 *     - name: x-access-token
 *       in: header
 *       required: false
 *       type: string
 *     responses:
 *       '200':
 *         description: "Successful response, you are authenticated"
 *       '401':
 *         description: "Token was provided, but its not existing or user has no access to that method"
 *       '403':
 *         description: "No Token was provided"
 */
function registerUserTest(app: Application) {
    app.get('/test/user', authJwt.verifyToken, (req: Request, res: Response) => {
        res.status(200).send('User content');
    });
}

export function registerUserRoutes(app: Application) {
    registerAllTest(app);
    registerUserTest(app);
}