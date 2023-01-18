import express from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';

export const router = express.Router();

/* GET ALL PRODUCTS */
router.get('/', function (req, res, next) {
    Product.find(function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE PRODUCT BY ID */

router.get('/:id', function (req, res, next) {
    Product.findById(mongoose.Types.ObjectId.createFromHexString(req.params.id), function (err: mongoose.CallbackError, post: mongoose.Document) {
        if (err) return next(err);
        res.json(post);
    });
});

/* SAVE PRODUCT */

router.post('/', function (req, res, next) {
    Product.create(req.body, function (err: mongoose.CallbackError, post: mongoose.Document) {
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE PRODUCT */

router.put('/:id', function (req, res, next) {
    Product.findByIdAndUpdate(mongoose.Types.ObjectId.createFromHexString(req.params.id), req.body, function (err: mongoose.CallbackError, post: mongoose.Document) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE PRODUCT */

router.delete('/:id', function (req, res, next) {
    Product.findByIdAndRemove(mongoose.Types.ObjectId.createFromHexString(req.params.id), req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});