import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Expense } from '../models/expense.model';
import { Account } from '../models/account.model';
import { Category } from '../models/categories.model';

/**
 * @swagger
 * /expense:
 *   get:
 *     tags:
 *     - "Expense API"
 *     description: Brings up all expenses for your user if no category_id, account_id or expense_id is specified
 *     summary: Get expenses
 *     operationId: expense__get
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
 *               expense_id:
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
 *                       title: "Expense ID"
 *                       type: "string"
 *                     expense_owner_id:
 *                       title: "Owning user ID"
 *                       type: "string"
 *                     expense_account_id:
 *                       title: "Account ID"
 *                       type: "string"
 *                     expense_category_id:
 *                       title: "Category ID"
 *                       type: "string"
 *                     expense_name:
 *                       title: "Expense name"
 *                       type: "string"
 *                     expense_value:
 *                       title: "Value of the expense"
 *                       type: "number"
 *                     expense_desc:
 *                       title: "Expense description"
 *                       type: "string"
 *                     expense_target_day:
 *                       title: "target Month day"
 *                       type: "number"
 *                     __v:
 *                       title: "Expense version"
 *                       type: "integer"
 *                 example:
 *                 - _id: "63cd6f99810a1500c067a70a"
 *                   expense_owner_id: "63cd40b83391382af2ae71fb"
 *                   expense_account_id: "63cd40b83391382af2ae71fb"
 *                   expense_category_id: "63cd40b83391382af2ae71fb"
 *                   expense_name: "Monthly Salary"
 *                   expense_value: 2482
 *                   expense_desc: "Every month on 30th"
 *                   expense_target_day: 30
 *                   __v: 0
 *                 - _id: "63cd6fbf810a1500c067a70d"
 *                   expense_owner_id: "63cd40b83391382af2ae71fb"
 *                   expense_account_id: "63cd40b83391382af2ae71fb"
 *                   expense_category_id: "63cd40b83391382af2ae71fb"
 *                   expense_name: "Tax returns"
 *                   expense_value: 143
 *                   expense_desc: "Just once"
 *                   expense_target_day: -1
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
 *               message: "Specified expense_id not found."
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
function registerGetExpenseFromUser(app: Application) {
    app.get('/expense', authJwt.verifyToken, async (req, res) => {
        try {
            const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
            let expenses;
            if (req.body.expense_id) {
                const inc_id = mongoose.Types.ObjectId.createFromHexString(req.body.expense_id);
                expenses = await Expense.find({ expense_owner_id: user_id, _id: inc_id }).exec();
                if (expenses.length == 0) {
                    res.status(404).send({ message: 'Specified expense_id not found.' });
                    return;
                }
            } else if (req.body.account_id) {
                const acc_id = mongoose.Types.ObjectId.createFromHexString(req.body.account_id);
                expenses = await Expense.find({ expense_owner_id: user_id, expense_account_id: acc_id }).exec();
                if (expenses.length == 0) {
                    res.status(404).send({ message: 'No expense for account found.' });
                    return;
                }
            } else if (req.body.category_id) {
                const cat_id = mongoose.Types.ObjectId.createFromHexString(req.body.category_id);
                expenses = await Expense.find({ expense_owner_id: user_id, expense_category_id: cat_id }).exec();
                if (expenses.length == 0) {
                    res.status(404).send({ message: 'No expense for category found.' });
                    return;
                }
            } else {
                expenses = await Expense.find({ expense_owner_id: user_id }).exec();
            }
            res.json(expenses);

        } catch (err) {
            res.status(500).send({ message: `Unknown error occured: ${err}` });
        }

    });
}

/**
 * @swagger
 * /expense:
 *   post:
 *     tags:
 *     - "Expense API"
 *     summary: "Create new expense"
 *     description: "Create a new expense"
 *     operationId: "expense__post"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - expense_name
 *             - expense_value
 *             - expense_account_id
 *             - expense_category_id
 *             properties:
 *               account_id:
 *                 type: "string"
 *                 example: "f343dfgj435jkgfn34dfdgdf"
 *               category_id:
 *                 type: "string"
 *                 example: "f343dfgj435jkgfn34dfdgdf"
 *               expense_name:
 *                 type: "string"
 *                 example: "Salary"
 *               expense_value:
 *                 type: "number"
 *                 example: 2500
 *               expense_desc:
 *                 type: "string"
 *                 example: "Monthly Salary"
 *               expense_target_day:
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
 *               message: "expense creation was successful"
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
 *               message: "No expense name and/or type was provided."
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
function registerCreateExpense(app: Application) {
    app.post('/expense', authJwt.verifyToken, async (req, res, next) => {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);

        if (!req.body.account_id) {
            res.status(400).send({ message: 'No account ID was provided.' });
            return;
        }

        if (!req.body.expense_name) {
            res.status(400).send({ message: 'No expense name was provided.' });
            return;
        }

        if (!req.body.expense_value) {
            res.status(400).send({ message: 'No expense value was provided.' });
            return;
        }

        if (!req.body.category_id) {
            res.status(400).send({ message: 'No expense category ID was provided.' });
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
            expense_owner_id: user_id,
            expense_account_id: account.id,
            expense_category_id: category.id,
            expense_name: sanitize(req.body.expense_name),
            expense_value: sanitize(req.body.expense_value),
            expense_desc: sanitize(req.body.expense_desc),
            expense_target_day: sanitize(req.body.expense_target_day),
        };

        try {
            await Expense.create(data);
            res.status(200).send({ message: 'expense creation was successful' });
        } catch (err) {
            if (err) {
                return next(err);
            }
        }
    });
}

/**
 * @swagger
 * /expense:
 *   delete:
 *     tags:
 *     - "Expense API"
 *     summary: "Delete an expense"
 *     description: "Delete an expense"
 *     operationId: "expense__delete"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - expense_id
 *             properties:
 *               expense_id:
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
 *               message: "expense deleted successfully"
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
 *               message: "No matching expense was found for your user."
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
function registerDeleteExpense(app: Application) {
    app.delete('/expense', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
        const expense_id = mongoose.Types.ObjectId.createFromHexString(req.body.expense_id);

        Expense.findOneAndDelete({
            _id: expense_id,
            expense_owner_id: user_id,
        }, (err: mongoose.CallbackError, result: mongoose.Document) => {
            if (err) return next(err);

            if (!result) {
                res.status(404).send({ message: 'No matching expense was found for your user.' });
            } else {
                res.status(200).send({ message: 'expense deleted successfully' });
            }
        });
    });
}

/**
 * @swagger
 * /expense:
 *   put:
 *     tags:
 *     - "Expense API"
 *     summary: "Update an expense"
 *     description: "Update an expense for your user, expense_id is required, everything else is optional."
 *     operationId: "expense__put"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - expense_id
 *             properties:
 *               expense_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               expense_name:
 *                 type: "string"
 *                 example: "Subscriptions"
 *               expense_value:
 *                 type: "number"
 *                 example: 2500
 *               expense_desc:
 *                 type: "string"
 *                 example: "Monthly Salary"
 *               expense_target_day:
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
 *               message: "expense modified successfully"
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
 *               message: "No matching expense was found for your user."
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
function registerUpdateExpense(app: Application) {
    app.put('/expense', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
        const expense_id = mongoose.Types.ObjectId.createFromHexString(req.body.expense_id);

        const data = {
            expense_name: sanitize(req.body.expense_name),
            expense_value: sanitize(req.body.expense_value),
            expense_desc: sanitize(req.body.expense_desc),
            expense_target_day: sanitize(req.body.expense_target_day),
        };

        Expense.findOneAndUpdate({
            _id: expense_id,
            expense_owner_id: user_id,
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

export function registerExpenseRoutes(app: Application) {
    registerGetExpenseFromUser(app);
    registerCreateExpense(app);
    registerDeleteExpense(app);
    registerUpdateExpense(app);
}