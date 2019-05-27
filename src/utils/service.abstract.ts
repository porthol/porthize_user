import { serviceManager } from './service.manager';
import { Document, Model, Schema } from 'mongoose';
import { IService } from './service.interface';
import * as mongoose from 'mongoose';

export abstract class Service<T extends Document> implements IService {
    protected readonly _name: string;
    protected readonly _model: Model<T>;

    abstract create(data: any): any;

    name(): string {
        return this._name;
    }

    model(): Model<any> {
        return this._model;
    }
    protected constructor(model: Model<T>, name: string) {
        this._model = model;
        this._name = name;
    }

    protected static getService<T extends Service<Document>>(
        schema: Schema,
        name: string,
        collection: string,
        c: new (model: Model<Document>, name: string) => T
    ): T {
        let service = serviceManager.getService(name) as T;
        if (!service) {
            const model = mongoose.model(name, schema, collection);
            service = new c(model, name);
            serviceManager.registerService(service);
        }
        return service;
    }
}
