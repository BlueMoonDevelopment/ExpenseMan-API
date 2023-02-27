import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Income } from '../models/income.model';

// TODO: Create API

function registerGetIncomeFromUser(app: Application) {
    app.get('/income', authJwt.verifyToken, async (req, res) => {
        try {
            const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
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
            } else {
                incomes = await Income.find({ income_owner_id: user_id }).exec();
            }
            res.json(incomes);

        } catch (err) {
            res.status(500).send({ message: `Unknown error occured: ${err}` });
        }

    });
}

function registerCreateIncome(app: Application) {
    app.post('/income', authJwt.verifyToken, async (req, res, next) => {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);

        if (!req.body.account_id) {
            res.status(400).send({ message: 'No account ID was provided.' });
            return;
        }

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

export function registerIncomeRoutes(app: Application) {
    registerGetCategoriesFromUser(app);
    registerCreateCategory(app);
    registerDeleteCategory(app);
    registerUpdateCategory(app);
}