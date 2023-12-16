import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Income } from '../models/income.model';
import { Account } from '../models/account.model';
import { Category } from '../models/categories.model';

/**
 * @swagger
 * /income:
 *   get:
 *     tags:
 *     - "Income API"
 *     description: Brings up all incomes for your user if no category_id, account_id or income_id is specified
 *     summary: Get incomes
 *     operationId: income__get
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               category_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               account_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               income_id:
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
 *                       title: "income ID"
 *                       type: "string"
 *                     income_owner_id:
 *                       title: "Owning user ID"
 *                       type: "string"
 *                     income_account_id:
 *                       title: "Account ID"
 *                       type: "string"
 *                     income_category_id:
 *                       title: "Category ID"
 *                       type: "string"
 *                     income_name:
 *                       title: "Income name"
 *                       type: "string"
 *                     income_value:
 *                       title: "Value of the income"
 *                       type: "number"
 *                     income_desc:
 *                       title: "income description"
 *                       type: "string"
 *                     income_target_day:
 *                       title: "target Month day"
 *                       type: "number"
 *                     __v:
 *                       title: "income version"
 *                       type: "integer"
 *                 example:
 *                 - _id: "63cd6f99810a1500c067a70a"
 *                   income_owner_id: "63cd40b83391382af2ae71fb"
 *                   income_account_id: "63cd40b83391382af2ae71fb"
 *                   income_category_id: "63cd40b83391382af2ae71fb"
 *                   income_name: "Monthly Salary"
 *                   income_value: 2482
 *                   income_desc: "Every month on 30th"
 *                   income_target_day: 30
 *                   __v: 0
 *                 - _id: "63cd6fbf810a1500c067a70d"
 *                   income_owner_id: "63cd40b83391382af2ae71fb"
 *                   income_account_id: "63cd40b83391382af2ae71fb"
 *                   income_category_id: "63cd40b83391382af2ae71fb"
 *                   income_name: "Tax returns"
 *                   income_value: 143
 *                   income_desc: "Just once"
 *                   income_target_day: -1
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
 *               message: "Specified income_id not found."
 *       401:
 *         description: "Unauthorized, request has no valid session"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "Unauthorized!"
 */
function registerGetIncomeFromUser(app: Application) {
    app.get('/income', authJwt.verifyToken, async (req, res) => {
        try {
            const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
            let incomes;
            if (req.body.income_id) {
                const inc_id = mongoose.Types.ObjectId.createFromHexString(req.body.income_id);
                incomes = await Income.find({ income_owner_id: user_id, _id: inc_id }).exec();
                if (incomes.length == 0) {
                    res.status(404).send({ message: 'Specified income_id not found.' });
                    return;
                }
            } else if (req.body.account_id) {
                const acc_id = mongoose.Types.ObjectId.createFromHexString(req.body.account_id);
                incomes = await Income.find({ income_owner_id: user_id, income_account_id: acc_id }).exec();
                if (incomes.length == 0) {
                    res.status(404).send({ message: 'No income for account found.' });
                    return;
                }
            } else if (req.body.category_id) {
                const cat_id = mongoose.Types.ObjectId.createFromHexString(req.body.category_id);
                incomes = await Income.find({ income_owner_id: user_id, income_category_id: cat_id }).exec();
                if (incomes.length == 0) {
                    res.status(404).send({ message: 'No income for category found.' });
                    return;
                }
            } else {
                incomes = await Income.find({ income_owner_id: user_id }).exec();
            }
            res.json(incomes);

        } catch (err) {
            res.status(500).send({ message: `Unknown error occured: ${err}` });
        }

    });
}

/**
 * @swagger
 * /income:
 *   post:
 *     tags:
 *     - "Income API"
 *     summary: "Create new income"
 *     description: "Create a new income"
 *     operationId: "income__post"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - income_name
 *             - income_value
 *             - income_account_id
 *             - income_category_id
 *             properties:
 *               account_id:
 *                 type: "string"
 *                 example: "f343dfgj435jkgfn34dfdgdf"
 *               category_id:
 *                 type: "string"
 *                 example: "f343dfgj435jkgfn34dfdgdf"
 *               income_name:
 *                 type: "string"
 *                 example: "Salary"
 *               income_value:
 *                 type: "number"
 *                 example: 2500
 *               income_desc:
 *                 type: "string"
 *                 example: "Monthly Salary"
 *               income_target_day:
 *                 type: "number"
 *                 example: 30
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
 *               message: "Income creation was successful"
 *       400:
 *         description: "Missing information"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No income name and/or type was provided."
 *       401:
 *         description: "Unauthorized, request has no valid session"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "Unauthorized!"
 */
function registerCreateIncome(app: Application) {
    app.post('/income', authJwt.verifyToken, async (req, res, next) => {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);

        if (!req.body.account_id) {
            res.status(400).send({ message: 'No account ID was provided.' });
            return;
        }

        if (!req.body.income_name) {
            res.status(400).send({ message: 'No Income name was provided.' });
            return;
        }

        if (!req.body.income_value) {
            res.status(400).send({ message: 'No Income value was provided.' });
            return;
        }

        if (!req.body.category_id) {
            res.status(400).send({ message: 'No Income category ID was provided.' });
            return;
        }

        let category;
        let account;

        try {
            category = await Category.findOne({
                _id: mongoose.Types.ObjectId.createFromHexString(req.body.category_id),
                category_owner_id: user_id,
            });
            if (!category) {
                res.status(400).send({ message: 'No category with given category_id was found for your user.' });
                return;
            }

            account = await Account.findOne({
                _id: mongoose.Types.ObjectId.createFromHexString(req.body.account_id),
                account_owner_id: user_id,
            }).exec();
            if (!account) {
                res.status(400).send({ message: 'No account with given account_id was found for your user.' });
                return;
            }
        } catch (e) {
            res.status(400).send({ message: 'account_id or category_id are not valid.' });
            return;
        }


        const data = {
            income_owner_id: user_id,
            income_account_id: account.id,
            income_category_id: category.id,
            income_name: sanitize(req.body.income_name),
            income_value: sanitize(req.body.income_value),
            income_desc: sanitize(req.body.income_desc),
            income_target_day: sanitize(req.body.income_target_day),
        };

        try {
            await Income.create(data);
            res.status(200).send({ message: 'Income creation was successful' });
        } catch (err) {
            if (err) return next(err);
        }
    });
}

/**
 * @swagger
 * /income:
 *   delete:
 *     tags:
 *     - "Income API"
 *     summary: "Delete an income"
 *     description: "Delete an income"
 *     operationId: "income__delete"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - income_id
 *             properties:
 *               income_id:
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
 *               message: "Income deleted successfully"
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
 *               message: "No matching income was found for your user."
 *       401:
 *         description: "Unauthorized, request has no valid session"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "Unauthorized!"
 */
function registerDeleteIncome(app: Application) {
    app.delete('/income', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
        const income_id = mongoose.Types.ObjectId.createFromHexString(req.body.income_id);

        Income.findOneAndDelete({
            _id: income_id,
            income_owner_id: user_id,
        }, (err: mongoose.CallbackError, result: mongoose.Document) => {
            if (err) return next(err);

            if (!result) {
                res.status(404).send({ message: 'No matching income was found for your user.' });
            } else {
                res.status(200).send({ message: 'Income deleted successfully' });
            }
        });
    });
}

/**
 * @swagger
 * /income:
 *   put:
 *     tags:
 *     - "Income API"
 *     summary: "Update an income"
 *     description: "Update an income for your user, income_id is required, everything else is optional."
 *     operationId: "income__put"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - income_id
 *             properties:
 *               income_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               income_name:
 *                 type: "string"
 *                 example: "Subscriptions"
 *               income_value:
 *                 type: "number"
 *                 example: 2500
 *               income_desc:
 *                 type: "string"
 *                 example: "Monthly Salary"
 *               income_target_day:
 *                 type: "number"
 *                 example: 30
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
 *               message: "Income modified successfully"
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
 *               message: "No matching income was found for your user."
 *       401:
 *         description: "Unauthorized, request has no valid session"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "Unauthorized!"
 */
function registerUpdateIncome(app: Application) {
    app.put('/income', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
        const income_id = mongoose.Types.ObjectId.createFromHexString(req.body.income_id);

        const data = {
            income_name: sanitize(req.body.income_name),
            income_value: sanitize(req.body.income_value),
            income_desc: sanitize(req.body.income_desc),
            income_target_day: sanitize(req.body.income_target_day),
        };

        Income.findOneAndUpdate({
            _id: income_id,
            income_owner_id: user_id,
        }, data, (err: mongoose.CallbackError, result: mongoose.Document) => {
            if (err) return next(err);

            if (!result) {
                res.status(404).send({ message: 'No matching category was found for your user.' });
            } else {
                res.status(200).send({ message: 'Category updated successfully' });
            }
        });
    });
}

export function registerIncomeRoutes(app: Application) {
    registerGetIncomeFromUser(app);
    registerCreateIncome(app);
    registerDeleteIncome(app);
    registerUpdateIncome(app);
}