import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Category } from '../models/categories.model';


/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *     - "Category API"
 *     description: Brings up all categories for your user
 *     summary: Get categories
 *     operationId: categories__get
 *     parameters:
 *     - in: query
 *       required: false
 *       name: category_id
 *       schema:
 *         type: "string"
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
 *                       title: "Category ID"
 *                       type: "string"
 *                     category_owner_id:
 *                       title: "Owning user ID"
 *                       type: "string"
 *                     category_name:
 *                       title: "Category name"
 *                       type: "string"
 *                     category_type:
 *                       title: "Category type"
 *                       type: "string"
 *                     category_desc:
 *                       title: "Category description"
 *                       type: "string"
 *                     category_color:
 *                       title: "Cateogory color"
 *                       type: "string"
 *                     category_symbol:
 *                       title: "Category Symbol"
 *                       type: "string"
 *                     __v:
 *                       title: "Category version"
 *                       type: "integer"
 *                 example:
 *                 - _id: "63cd6f99810a1500c067a70a"
 *                   category_owner_id: "63cd40b83391382af2ae71fb"
 *                   category_name: "Subscriptions"
 *                   category_type: "Expenses"
 *                   category_desc: ""
 *                   category_color: "red"
 *                   category_symbol: "MoneyBag"
 *                   __v: 0
 *                 - _id: "63cd6fbf810a1500c067a70d"
 *                   category_owner_id: "63cd40b83391382af2ae71fb"
 *                   category_name: "Work"
 *                   category_type: "Income"
 *                   category_desc: "Hourly income from my job"
 *                   category_color: "green"
 *                   category_symbol: "MoneyBag"
 *                   __v: 0
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
 *               message: "Specified category_id not found."
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
function registerGetCategoriesFromUser(app: Application) {
    app.get('/categories', authJwt.verifyToken, async (req, res) => {
        try {
            const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
            const categoryId = req.query.category_id;

            let categories;

            if (categoryId) {
                const cat_id = mongoose.Types.ObjectId.createFromHexString(categoryId.toString());
                categories = await Category.find({ category_owner_id: user_id, _id: cat_id }).exec();
                if (categories.length == 0) {
                    res.status(404).send({ message: 'Specified category_id not found.' });
                    return;
                }
            } else {
                categories = await Category.find({ category_owner_id: user_id }).exec();
            }
            res.json(categories);

        } catch (err) {
            res.status(500).send({ message: `Unknown error occured: ${err}` });
        }

    });
}

/**
 * @swagger
 * /categories:
 *   post:
 *     tags:
 *     - "Category API"
 *     summary: "Create new category"
 *     description: "Create a new category"
 *     operationId: "categories__post"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - category_name
 *             - category_type
 *             properties:
 *               category_name:
 *                 type: "string"
 *                 example: "Subscriptions"
 *               category_type:
 *                 type: "string"
 *                 example: "Expenses"
 *               category_desc:
 *                 type: "string"
 *                 example: "Monthly streaming service charges"
 *               category_color:
 *                 type: "string"
 *                 example: "red"
 *               category_symbol:
 *                 type: "string"
 *                 example: "MoneyBag"
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
 *               message: "Category creation was successful"
 *       400:
 *         description: "No category name provided"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   title: "Error message"
 *                   type: "string"
 *             example:
 *               message: "No category name and/or type was provided."
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
function registerCreateCategory(app: Application) {
    app.post('/categories', authJwt.verifyToken, async (req, res, next) => {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);

        if (!req.body.category_name) {
            res.status(400).send({ message: 'No category name was provided.' });
            return;
        }

        if (!req.body.category_type) {
            res.status(400).send({ message: 'No category type was provided.' });
            return;
        }

        const data = {
            category_owner_id: user_id,
            category_name: sanitize(req.body.category_name),
            category_type: sanitize(req.body.category_type),
            category_desc: sanitize(req.body.category_desc),
            category_color: sanitize(req.body.category_color),
            category_symbol: sanitize(req.body.category_symbol),
        };

        try {
            await Category.create(data);
            res.status(200).send({ message: 'Category creation was successful' });
        } catch (err) {
            if (err) return next(err);
        }
    });
}


/**
 * @swagger
 * /categories:
 *   delete:
 *     tags:
 *     - "Category API"
 *     summary: "Delete a category"
 *     description: "Delete a category"
 *     operationId: "categories__delete"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - category_id
 *             properties:
 *               category_id:
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
 *               message: "Category deleted successfully"
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
 *               message: "No matching category was found for your user."
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
function registerDeleteCategory(app: Application) {
    app.delete('/categories', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
        const category_id = mongoose.Types.ObjectId.createFromHexString(req.body.category_id);

        Category.findOneAndDelete({
            _id: category_id,
            category_owner_id: user_id,
        }, (err: mongoose.CallbackError, result: mongoose.Document) => {
            if (err) return next(err);

            if (!result) {
                res.status(404).send({ message: 'No matching category was found for your user.' });
            } else {
                res.status(200).send({ message: 'Category deleted successfully' });
            }
        });
    });
}


/**
 * @swagger
 * /categories:
 *   put:
 *     tags:
 *     - "Category API"
 *     summary: "Update a category"
 *     description: "Update a category for your user, category_id is required, everything else is optional."
 *     operationId: "categories__put"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *             - category_id
 *             properties:
 *               category_id:
 *                 type: "string"
 *                 example: "63cdbc09a3adb6d82c13254a"
 *               category_name:
 *                 type: "string"
 *                 example: "Subscriptions"
 *               category_type:
 *                 type: "string"
 *                 example: "Expenses"
 *               category_desc:
 *                 type: "string"
 *                 example: "Yearly license charges"
 *               category_color:
 *                 type: "string"
 *                 example: "blue"
 *               category_symbol:
 *                 type: "string"
 *                 example: "BankSymbol"
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
 *               message: "Category modified successfully"
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
 *               message: "No matching category was found for your user."
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
function registerUpdateCategory(app: Application) {
    app.put('/categories', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.session.userId);
        const category_id = mongoose.Types.ObjectId.createFromHexString(req.body.category_id);

        const data = {
            category_name: sanitize(req.body.category_name),
            category_type: sanitize(req.body.category_type),
            category_desc: sanitize(req.body.category_desc),
            category_color: sanitize(req.body.category_color),
            category_symbol: sanitize(req.body.category_symbol),
        };

        Category.findOneAndUpdate({
            _id: category_id,
            category_owner_id: user_id,
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

export function registerCategoryRoutes(app: Application) {
    registerGetCategoriesFromUser(app);
    registerCreateCategory(app);
    registerDeleteCategory(app);
    registerUpdateCategory(app);
}