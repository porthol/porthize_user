import { serviceManager } from './service.manager';
import { MongoConnection } from './mongo-connection';
import { Document, Model, Schema } from 'mongoose';
import { IService } from './service.interface';

export abstract class Service<T extends Document> implements IService {
    protected readonly _name: string;
    protected readonly _ws: string;
    protected readonly _model: Model<T>;

    protected constructor(ws: string, model: Model<T>, name: string) {
        this._ws = ws;
        this._model = model;
        this._name = name;
    }

    protected static getService<T extends Service<Document>>(
        ws: string,
        schema: Schema,
        name: string,
        collection: string,
        c: new (ws: string, model: Model<Document>, name: string) => T
    ): T {
        let service = serviceManager.getService(ws, name) as T;
        if (!service) {
            const model = MongoConnection.connections[ws].getConnection().model(name, schema, collection);
            service = new c(ws, model, name);
            serviceManager.registerService(ws, service);
        }
        return service;
    }

    abstract create(data: any): any;

    name(): string {
        return this._name;
    }

    model(): Model<any> {
        return this._model;
    }

    workspace(): string {
        return this._ws;
    }
}
