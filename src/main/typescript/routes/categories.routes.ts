import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Category } from '../models/categories.model';


function registerGetCategoriesFromUser(app: Application) {
    app.get('/categories', authJwt.verifyToken, async (req, res) => {
        try {
            const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);

            let categories;

            if (req.body.category_id) {
                const cat_id = mongoose.Types.ObjectId.createFromHexString(req.body.category_id);
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


function registerCreateCategory(app: Application) {
    app.post('/categories', authJwt.verifyToken, async (req, res, next) => {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);

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

        Category.create(data, function (err: mongoose.CallbackError) {
            if (err) return next(err);
            res.status(200).send({ message: 'Category creation was successful' });
        });
    });
}

function registerDeleteCategory(app: Application) {
    app.delete('/categories', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
        const category_id = mongoose.Types.ObjectId.createFromHexString(req.body.category_id);

        Category.findOneAndRemove({
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

function registerUpdateCategory(app: Application) {
    app.put('/categories', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
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