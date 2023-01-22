import { Application } from 'express';
import { authJwt } from '../middlewares/authJwt';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

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
 *       '200':
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
 *                     updated_at:
 *                       title: "Last update"
 *                       type: "string"
 *                       format: "date-time"
 *                     __v:
 *                       title: "Account version"
 *                       type: "integer"
 *                 example:
 *                 - _id: "63c7c1d12e18c3864a4e9645"
 *                   prod_name: "HP laptop "
 *                   prod_desc: "the new hp"
 *                   prod_price: 999,
 *                   updated_at: "2023-01-18T09:54:25.790Z"
 *                   __v: 0
 *                 - _id: "63c7c1d12e18c3864a4e1234"
 *                   prod_name: "Dell laptop "
 *                   prod_desc: "the new dell"
 *                   prod_price: 1000
 *                   updated_at: "2023-01-18T09:54:25.790Z"
 *                   __v: 0
 */
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