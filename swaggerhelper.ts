import { Application } from 'express';
import * as swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.OAS3Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'ExpenseMan API',
            description: '## The official JSON API for ExpenseMan',
            version: '0.0.1',
            license: {
                name: 'GPL-3.0',
                url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
            },
        },
    },
    apis: [
        `${__dirname}/swaggerhelper.ts`,
        `${__dirname}/routes/*.ts`,
    ],
};

const spec = swaggerJSDoc.default(options);

/**
 * @swagger
 * /:
 *  get:
 *    tags:
 *    - "Root"
 *    summary: "Root"
 *    description: "Brings up API documentation\n\nReturns:\n    None"
 *    operationId: "root__get"
 *    responses:
 *      200:
 *        description: "Successful Response"
 */
export function register(app: Application) {
    app.use('/', swaggerUi.serve, swaggerUi.setup(spec));
}

