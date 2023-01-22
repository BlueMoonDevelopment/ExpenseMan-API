import { Application } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/product.model';
import { authJwt } from '../middlewares/authJwt';

/* GET ALL PRODUCTS */
/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *     - "Product API"
 *     description: Brings up all registered Products
 *     summary: Get all products
 *     operationId: products__get
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
 *                       title: "Product ID"
 *                       type: "string"
 *                     prod_name:
 *                       title: "Product Name"
 *                       type: "string"
 *                     prod_desc:
 *                       title: "Product Description"
 *                       type": "string"
 *                     prod_price:
 *                       title: "Product Price"
 *                       type: "number"
 *                     updated_at:
 *                       title: "Last update"
 *                       type: "string"
 *                       format: "date-time"
 *                     __v:
 *                       title: "Product version"
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
function registerGetAllProducts(app: Application) {
    app.get('/products', function (req, res, next) {
        Product.find(function (err, products) {
            if (err) return next(err);
            res.status(200).json(products);
        });
    });
}

/* GET SINGLE PRODUCT BY ID */
/**
 * @swagger
 * /products/{_id}/:
 *   get:
 *     tags:
 *       - "Product API"
 *     summary: "Get single product"
 *     description: "Brings up a signle registered Product"
 *     operationId: "products__get__by__id"
 *     parameters:
 *       - name: "_id"
 *         required: true
 *         schema:
 *           title: "_id"
 *           type: "string"
 *         in: "path"
 *         example: "63c8046428d4331d75959db1"
 *     responses:
 *       200:
 *         description: ""
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 _id:
 *                   title: "Product ID"
 *                   type: "string"
 *                 prod_name:
 *                   title: "Product Name"
 *                   type: "string"
 *                 prod_desc:
 *                   title: "Product Description"
 *                   type: "string"
 *                 prod_price:
 *                   title: "Product Price"
 *                   type: "number"
 *                 updated_at:
 *                   title: "Last update"
 *                   type: "string"
 *                   format: "date-time"
 *                 __v:
 *                   title: "Product version"
 *                   type: "integer"
 *             example:
 *               _id: "63c7c1d12e18c3864a4e9645"
 *               prod_name: "Generic laptop "
 *               prod_desc: "Just a basic generic laptop"
 *               prod_price: 100
 *               updated_at: "2023-01-18T09:54:25.790Z"
 *               __v: 0
 */
function registerGetSingleProduct(app: Application) {
    app.get('/products/:id', function (req, res, next) {
        Product.findById(mongoose.Types.ObjectId.createFromHexString(req.params.id), function (err: mongoose.CallbackError, post: mongoose.Document) {
            if (err) return next(err);
            res.json(post);
        });
    });
}

/* SAVE PRODUCT */
/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - "Product API"
 *     summary: "Create new product"
 *     description: "Create a new product"
 *     operationId: "products__post"
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
 *             - prod_name
 *             - prod_desc
 *             - prod_price
 *             properties:
 *               prod_name:
 *                 type: "string"
 *                 example: "Generic laptop"
 *               prod_desc:
 *                 type: "string"
 *                 example: "Just a basic generic laptop"
 *               prod_price:
 *                 type: "number"
 *                 example: 100
 *     responses:
 *       200:
 *         description: ""
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 _id:
 *                   title: "Product ID"
 *                   type: "string"
 *                 prod_name:
 *                   title: "Product Name"
 *                   type: "string"
 *                 prod_desc:
 *                   title: "Product Description"
 *                   type: "string"
 *                 prod_price:
 *                   title: "Product Price"
 *                   type: "number"
 *                 updated_at:
 *                   title: "Last update"
 *                   type: "string"
 *                   format: "date-time"
 *                 __v:
 *                   title: "Product version"
 *                   type: "integer"
 *           example:
 *               _id: "63c7c1d12e18c3864a4e9645"
 *               prod_name: "Generic laptop "
 *               prod_desc: "Just a basic generic laptop"
 *               prod_price: 100
 *               updated_at: "2023-01-18T09:54:25.790Z"
 *               __v: 0
 *           description: "Implements the JSON response model for the /products endpoint."
 */
function registerCreateProduct(app: Application) {
    app.post('/products/', authJwt.verifyToken, function (req, res, next) {
        Product.create(req.body, function (err: mongoose.CallbackError, post: mongoose.Document) {
            if (err) return next(err);
            res.json(post);
        });
    });
}

/* UPDATE PRODUCT */
/**
 * @swagger
 * /products/{_id}/:
 *   put:
 *     tags:
 *     - "Product API"
 *     summary: "Update existing product"
 *     description: "Update an existing product"
 *     operationId: "products__update_product"
 *     parameters:
 *       - name: "_id"
 *         required: true
 *         schema:
 *           title: "_id"
 *           type: "string"
 *         in: "path"
 *         example: "63c8046428d4331d75959db1"
 *       - name: x-access-token
 *         in: header
 *         schema:
 *           type: string
 *         required: true
 *     consumes:
 *     - "application/json"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               prod_name:
 *                 type: "string"
 *                 example: "Generic laptop"
 *               prod_desc:
 *                 type: "string"
 *                 example: "Just a basic generic laptop"
 *               prod_price:
 *                 type: "number"
 *                 example: 100
 *     responses:
 *       200:
 *         description: ""
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 _id:
 *                   title: "Product ID"
 *                   type: "string"
 *                 prod_name:
 *                   title: "Product Name"
 *                   type: "string"
 *                 prod_desc:
 *                   title: "Product Description"
 *                   type: "string"
 *                 prod_price:
 *                   title: "Product Price"
 *                   type: "number"
 *                 updated_at:
 *                   title: "Last update"
 *                   type: "string"
 *                   format: "date-time"
 *                 __v:
 *                   title: "Product version"
 *                   type: "integer"
 *           example:
 *               _id: "63c7c1d12e18c3864a4e9645"
 *               prod_name: "Generic laptop "
 *               prod_desc: "Just a basic generic laptop"
 *               prod_price: 100
 *               updated_at: "2023-01-18T09:54:25.790Z"
 *               __v: 0
 *           description: "Implements the JSON response model for the /products endpoint."
 */
function registerUpdateProduct(app: Application) {
    app.put('/products/:id', authJwt.verifyToken, function (req, res, next) {
        Product.findByIdAndUpdate(mongoose.Types.ObjectId.createFromHexString(req.params.id), req.body, function (err: mongoose.CallbackError, post: mongoose.Document) {
            if (err) return next(err);
            res.json(post);
        });
    });
}

/* DELETE PRODUCT */
/**
 * @swagger
 * /products/{_id}/:
 *   delete:
 *     tags:
 *     - "Product API"
 *     summary: "Delete product"
 *     description: "Deletes a registered Product"
 *     operationId: "products__delete__by__id"
 *     parameters:
 *       - name: "_id"
 *         required: true
 *         schema:
 *           title: "_id"
 *           type: "string"
 *         in: "path"
 *         example: "63c8046428d4331d75959db1"
 *       - name: x-access-token
 *         in: header
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "Returns null when either product not existing or successful"
 *         content:
 *           null
 */
function registerDeleteProduct(app: Application) {
    app.delete('/products/:id', authJwt.verifyToken, function (req, res, next) {
        Product.findByIdAndRemove(mongoose.Types.ObjectId.createFromHexString(req.params.id), req.body, function (err, post) {
            if (err) return next(err);
            res.json(post);
        });
    });
}

/**
 * Registers all routes
 * @param app
 */
export function registerProductRoutes(app: Application) {
    registerGetAllProducts(app);
    registerGetSingleProduct(app);
    registerCreateProduct(app);
    registerUpdateProduct(app);
    registerDeleteProduct(app);
}