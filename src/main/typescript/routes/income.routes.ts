import { Application } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { authJwt } from '../middlewares/authJwt';
import { Income } from '../models/income.model';
import { Account } from '../models/account.model';
import { Category } from '../models/categories.model';

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

function registerCreateIncome(app: Application) {
    app.post('/income', authJwt.verifyToken, async (req, res, next) => {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);

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

        const category = await Category.findOne({
            _id: mongoose.Types.ObjectId.createFromHexString(req.body.category_id),
            category_owner_id: user_id,
        });
        if (!category) {
            res.status(400).send({ message: 'No category with given category_id was found for your user.' });
            return;
        }

        const account = await Account.findOne({
            _id: mongoose.Types.ObjectId.createFromHexString(req.body.account_id),
            account_owner_id: user_id,
        }).exec();
        if (!account) {
            res.status(400).send({ message: 'No account with given account_id was found for your user.' });
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

        await Income.create(data, function (err: mongoose.CallbackError) {
            if (err) return next(err);
            res.status(200).send({ message: 'Income creation was successful' });
        });
    });
}


function registerDeleteIncome(app: Application) {
    app.delete('/income', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
        const income_id = mongoose.Types.ObjectId.createFromHexString(req.body.income_id);

        Income.findOneAndRemove({
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

function registerUpdateIncome(app: Application) {
    app.put('/income', authJwt.verifyToken, function (req, res, next) {
        const user_id = mongoose.Types.ObjectId.createFromHexString(req.body.token_user_id);
        const income_id = mongoose.Types.ObjectId.createFromHexString(req.body.income_id);

        const data = {
            income_name: sanitize(req.body.income_name),
            income_value: sanitize(req.body.income_value),
            income_desc: sanitize(req.body.income_desc),
            income_repeat_cycle: sanitize(req.body.income_repeat_cycle),
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