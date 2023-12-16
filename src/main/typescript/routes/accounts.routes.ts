import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Account } from '../models/account.model';
import { account_settings } from '../config.json';
import { Expense } from '../models/expense.model';
import { Income } from '../models/income.model';


function test(app: Application) {
    app.get('/test', async (req, res) => {
        console.log(req.session.userId);
        console.log(req.session.accessToken);
        res.send({ userID: req.session.userId, accessToken: req.session.accessToken });
    });
}

/**
 * @swagger
 * /accounts:
 *   get:
 *     tags:
 *     - "Account API"
 *     description: Brings up all Accounts for your user if no account_id is specified, or single account
 *     summary: Get accounts
 *     operationId: accounts__get
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               account_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
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
 *                     account_owner_id:
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
 *                     account_balance:
 *                       title: "Account balance"
 *                       type: "number"
 *                     account_expenses:
 *                       title: "Account expenses"
 *                       type: "array"
 *                     account_income:
 *                       title: "Account income"
 *                       type: "array"
 *                     __v:
 *                       title: "Account version"
 *                     type: "integer"
 *                 example:
 *                 - _id: "63cd6f99810a1500c067a70a"
 *                   account_owner_id: "63cd40b83391382af2ae71fb"
 *                   account_name: "Testaccount"
 *                   account_currency: "$"
 *                   account_desc: "First test account"
 *                   account_balance: 0
 *                   account_income:
 *                   - _id: "63fd11de3f5bd9907e72e0f1"
 *                     income_owner_id: "63cd40b83391382af2ae71fb"
 *                     income_account_id: "63cd6f99810a1500c067a70a"
 *                     income_name: "Basic income"
 *                     income_value: 2500
 *                     income_category_id: "63fd11293f5bd9907e72e0ec"
 *                     income_desc: "Basic income"
 *                     income_target_day: 30
 *                     __v: ""
 *                   account_expenses:
 *                   - _id: "63fd11de3f5bd9907e72e0f1"
 *                     expense_owner_id: "63cd40b83391382af2ae71fb"
 *                     expense_account_id: "63cd6f99810a1500c067a70a"
 *                     expense_name: "Basic expense"
 *                     expense_value: 25
 *                     expense_category_id: "63fd11293f5bd9907e72e0ec"
 *                     expense_desc: "Basic expense"
 *                     expense_target_day: 11
 *                     __v: ""
 *                   __v: 0
 *                 - _id: "63cd6fbf810a1500c067a70d"
 *                   account_owner_id: "63cd40b83391382af2ae71fb"
 *                   account_name: "Testaccount 2"
 *                   account_currency: "€"
 *                   account_desc: "This is the second test account"
 *                   account_balance: 100
 *                   account_income: []
 *                   account_expenses: []
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
 *       404:
 *         description: "Not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "Specified account_id not found."
 */
function registerGetAccountsFromUser(app: Application) {
    app.get('/accounts', authJwt.verifyToken, async (req, res) => {
        try {
            const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);

            let accounts;

            if (req.body.account_id) {
                const account_id = mongoose.Types.ObjectId.createFromHexString(req.body.account_id);
                accounts = await Account.find({ account_owner_id: user_id, _id: account_id }).exec();
                if (accounts.length == 0) {
                    res.status(404).send({ message: 'Specified account_id not found.' });
                    return;
                }
            } else {
                accounts = await Account.find({ account_owner_id: user_id }).exec();
            }

            for (const account of accounts) {
                const expenses = await Expense.find({ expense_owner_id: user_id, expense_account_id: account.id });
                account.account_expenses = expenses;
                const incomes = await Income.find({ income_owner_id: user_id, income_account_id: account.id });
                account.account_income = incomes;
            }

            res.json(accounts);
        } catch (err) {
            res.status(500).send({ message: `Unknown error occured: ${err}` });
        }

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
 *               account_balance:
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
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
        const limit = account_settings.account_limit;
        const accounts = await Account.find({ account_owner_id: user_id }).exec();

        if (accounts.length == limit) {
            res.status(409).send({ message: 'Account limit reached!' });
            return;
        }

        if (!req.body.account_name) {
            res.status(400).send({ message: 'No account name was provided.' });
            return;
        }

        const data = {
            account_owner_id: user_id,
            account_name: sanitize(req.body.account_name),
            account_currency: sanitize(req.body.account_currency),
            account_desc: sanitize(req.body.account_desc),
            account_balance: sanitize(req.body.account_balance),
        };

        try {
            await Account.create(data);
            res.status(200).send({ message: 'Account creation was successful' });
        } catch (err) {
            return next(err);
        }
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
 *             - account_id
 *             properties:
 *               account_id:
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
 *       404:
 *         description: "Not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No matching account was found for your user."
 */
function registerDeleteAccount(app: Application) {
    app.delete('/accounts', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
        const account_id = mongoose.Types.ObjectId.createFromHexString(req.body.account_id);

        Account.findOneAndDelete({
            _id: account_id,
            account_owner_id: user_id,
        }, async (err: mongoose.CallbackError, result: mongoose.Document) => {
            if (err) return next(err);

            if (!result) {
                res.status(404).send({ message: 'No matching account was found for your user.' });
            } else {
                await Expense.deleteMany({ expense_owner_id: user_id, expense_account_id: account_id });
                await Income.deleteMany({ income_owner_id: user_id, income_account_id: account_id });
                res.status(200).send({ message: 'Account and all regarding incomes and expenses deleted successfully.' });
            }
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
 *     description: "Update an account for your user, account_id is required, everything else is optional."
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
 *             - account_id
 *             properties:
 *               account_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               account_name:
 *                 type: "string"
 *                 example: "My income"
 *               account_currency:
 *                 type: "string"
 *                 example: "$"
 *               account_desc:
 *                 type: "string"
 *                 example: "universal bank"
 *               account_balance:
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
 *       404:
 *         description: "Not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No matching account was found for your user."
 */
function registerUpdateAccount(app: Application) {
    app.put('/accounts', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
        const account_id = mongoose.Types.ObjectId.createFromHexString(req.body.account_id);

        const data = {
            account_name: sanitize(req.body.account_name),
            account_currency: sanitize(req.body.account_currency),
            account_desc: sanitize(req.body.account_desc),
            account_balance: sanitize(req.body.account_balance),
        };

        Account.findOneAndUpdate({
            _id: account_id,
            account_owner_id: user_id,
        }, data, (err: mongoose.CallbackError, result: mongoose.Document) => {
            if (err) return next(err);

            if (!result) {
                res.status(404).send({ message: 'No matching account was found for your user.' });
            } else {
                res.status(200).send({ message: 'Account updated successfully' });
            }
        });
    });
}

export function registerAccountRoutes(app: Application) {
    registerGetAccountsFromUser(app);
    registerCreateAccount(app);
    registerDeleteAccount(app);
    registerUpdateAccount(app);
    test(app);
}