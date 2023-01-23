import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Account } from '../models/account.model';
import { account_settings } from '../config.json';


/**
 * @swagger
 * /accounts:
 *   get:
 *     tags:
 *     - "Account API"
 *     description: Brings up all Accounts for your user
 *     summary: Get all accounts
 *     operationId: accounts__get
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Successful Response
 *         content:
 *           application/json:
 *               schema:
 *                 type: "array"
 *                 items:
 *                   type: "object"
 *                   properties:
 *                     _id:
 *                       title: "Account ID"
 *                       type: "string"
 *                     user_id:
 *                       title: "Owning user ID"
 *                       type: "string"
 *                     account_name:
 *                       title: "Account name"
 *                       type: "string"
 *                     account_currency:
 *                       title: "Account currency"
 *                       type: "string"
 *                     account_desc:
 *                       title: "Account description"
 *                       type: "string"
 *                     balance:
 *                       title: "Account balance"
 *                       type: "number"
 *                     __v:
 *                       title: "Account version"
 *                       type: "integer"
 *                 example:
 *                 - _id: "63cd6f99810a1500c067a70a"
 *                   user_id: "63cd40b83391382af2ae71fb"
 *                   account_name: "Testaccount"
 *                   account_currency: "$"
 *                   account_desc: ""
 *                   balance: 0,
 *                   __v: 0
 *                 - _id: "63cd6fbf810a1500c067a70d"
 *                   user_id: "63cd40b83391382af2ae71fb"
 *                   account_name: "Testaccount 2"
 *                   account_currency: "€"
 *                   account_desc: "This is the second test account"
 *                   balance: 100,
 *                   __v: 0
 *       401:
 *         description: "No token provided or token is wrong"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No token provided!"
 */
function registerGetAccountsFromUser(app: Application) {
    app.get('/accounts', authJwt.verifyToken, async (req, res) => {
        const id = sanitize(req.body.id);
        const accounts = await Account.find({ user_id: id }).exec();
        res.json(accounts);
    });
}

/**
 * @swagger
 * /accounts:
 *   post:
 *     tags:
 *     - "Account API"
 *     summary: "Create new account"
 *     description: "Create a new account"
 *     operationId: "accounts__post"
 *     consumes:
 *     - "application/json"
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - account_name
 *             properties:
 *               account_name:
 *                 type: "string"
 *                 example: "My income"
 *               account_currency:
 *                 type: "string"
 *                 example: "$"
 *               account_desc:
 *                 type: "string"
 *                 example: "universal bank"
 *               balance:
 *                 type: "number"
 *                 example: 1134
 *     responses:
 *       200:
 *         description: "Successful response"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Confirmation message"
 *                   type: "string"
 *             example:
 *               message: "Account creation was successful"
 *       401:
 *         description: "No token provided or token is wrong"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No token provided!"
 *       409:
 *         description: "Limit reached"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "Account limit reached!"
 *       400:
 *         description: "No account name provided"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No account name was provided."
 */
function registerCreateAccount(app: Application) {
    app.post('/accounts', authJwt.verifyToken, async (req, res, next) => {
        const id = sanitize(req.body.id);
        const limit = account_settings.account_limit;
        const accounts = await Account.find({ user_id: id }).exec();

        if (accounts.length == limit) {
            res.status(409).send({ message: 'Account limit reached!' });
            return;
        }

        if (!req.body.account_name) {
            res.status(400).send({ message: 'No account name was provided.' });
            return;
        }

        const data = {
            user_id: id,
            account_name: sanitize(req.body.account_name),
            account_currency: sanitize(req.body.account_currency),
            account_desc: sanitize(req.body.account_desc),
            balance: sanitize(req.body.balance),
        };

        await Account.create(data, function (err: mongoose.CallbackError) {
            if (err) return next(err);
            res.status(200).send({ message: 'Account creation was successful' });
        });
    });
}

/**
 * @swagger
 * /accounts:
 *   delete:
 *     tags:
 *     - "Account API"
 *     summary: "Delete an account"
 *     description: "Delete an account"
 *     operationId: "accounts__delete"
 *     consumes:
 *     - "application/json"
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - _id
 *             - user_id
 *             properties:
 *               _id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               user_id:
 *                 type: "string"
 *                 example: "f343dfgj435jkgfn34dfdgdf"
 *     responses:
 *       200:
 *         description: "Successful response"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Confirmation message"
 *                   type: "string"
 *             example:
 *               message: "Account deleted successfully"
 *       401:
 *         description: "No token provided or token is wrong"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No token provided!"
 *       403:
 *         description: "Not an authorized user"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "You are not authorized to delete this account."
 */
function registerDeleteAccount(app: Application) {
    app.delete('/accounts', authJwt.verifyToken, function (req, res, next) {
        const id = sanitize(req.body.id);
        if (id != req.body.user_id) {
            res.status(403).send({ message: 'You are not authorized to delete this account.' });
            return;
        }
        Account.findByIdAndRemove(mongoose.Types.ObjectId.createFromHexString(req.body._id), sanitize(req.body), function (err, post) {
            if (err) return next(err);
            res.status(200).send({ message: 'Account deleted successfully' });
        });
    });
}

/**
 * @swagger
 * /accounts:
 *   put:
 *     tags:
 *     - "Account API"
 *     summary: "Update an account"
 *     description: "update an account"
 *     operationId: "accounts__put"
 *     consumes:
 *     - "application/json"
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - _id
 *             - user_id
 *             properties:
 *               _id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               user_id:
 *                 type: "string"
 *                 example: "f343dfgj435jkgfn34dfdgdf"
 *               account_name:
 *                 type: "string"
 *                 example: "My income"
 *               account_currency:
 *                 type: "string"
 *                 example: "$"
 *               account_desc:
 *                 type: "string"
 *                 example: "universal bank"
 *               balance:
 *                 type: "number"
 *                 example: 1134
 *     responses:
 *       200:
 *         description: "Successful response"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Confirmation message"
 *                   type: "string"
 *             example:
 *               message: "Account modified successfully"
 *       401:
 *         description: "No token provided or token is wrong"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No token provided!"
 *       403:
 *         description: "Not an authorized user"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "You are not authorized to modify this account."
 */
function registerUpdateAccount(app: Application) {
    app.put('/accounts', authJwt.verifyToken, function (req, res, next) {
        const id = sanitize(req.body.id);
        if (id != req.body.user_id) {
            res.status(403).send({ message: 'You are not authorized to modify this account.' });
            return;
        }
        Account.findByIdAndUpdate(mongoose.Types.ObjectId.createFromHexString(req.body._id), sanitize(req.body), function (err: mongoose.CallbackError, post: mongoose.Document) {
            if (err) return next(err);
            res.status(200).send({ message: 'Account modified successfully' });
        });
    });
}

export function registerAccountRoutes(app: Application) {
    registerGetAccountsFromUser(app);
    registerCreateAccount(app);
    registerDeleteAccount(app);
    registerUpdateAccount(app);
}