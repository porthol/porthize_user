import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ExampleSchema } from './example.model';
import ObjectId = mongoose.Types.ObjectId;
import { Service } from '../utils/service.abstract';
import { IExample } from './example.document';

export class ExampleService extends Service<IExample> {
    constructor(ws: string, model: Model<IExample>) {
        super(ws, model, 'example');
    }

    public static get(ws: string): ExampleService {
        return super.getService(
            ws,
            ExampleSchema,
            'example',
            'examples',
            ExampleService
        );
    }

    async getAll(criteria: any) {
        return await this._model.find(criteria || {});
    }

    async get(id: ObjectId, criteria: any) {
        criteria._id = new ObjectId(id);
        return await this._model.findOne(criteria || {});
    }

    async create(data: any) {
        const example = new this._model(data);
        return await example.save();
    }

    async update(id: ObjectId, userData: any) {
        return await this._model.updateOne({ _id: id }, userData);
    }

    async delete(id: ObjectId) {
        return await this._model.deleteOne({ _id: id });
    }
}
