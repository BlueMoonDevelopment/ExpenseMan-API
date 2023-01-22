import { Application } from 'express';
import { authJwt } from '../middlewares/authJwt';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

function registerGetAccountsFromUser(app: Application) {
    app.get('/accounts', authJwt.verifyToken, async (req, res) => {
        const id = req.body.id;

        const user = await User.findById(mongoose.Types.ObjectId.createFromHexString(id)).exec();
        if (user) {
            res.send(user.accounts);
        } else {
            res.status(401).send('no user found!');
        }
    });
}

export function registerAccountRoutes(app: Application) {
    registerGetAccountsFromUser(app);
}