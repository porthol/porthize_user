declare module 'express-json-validator-middleware' {
    import * as ajv from 'ajv';
    import { RequestHandler } from 'express';

    interface ValidationOptions {
        body?: object;
        params?: object;
        query?: object;
    }

    interface ValidationErrors {
        body?: [ajv.ErrorObject];
        params?: [ajv.ErrorObject];
        query?: [ajv.ErrorObject];
    }

    export class Validator {
        constructor(ajvOptions: ajv.Options);

        validate(validateOptions: ValidationOptions): RequestHandler;
    }

    export class ValidationError extends Error {
        validationErrors: [ValidationErrors];

        constructor(validationErrors: [ValidationErrors]);
    }
}
