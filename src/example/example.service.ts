import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ExampleSchema } from './example.model';
import ObjectId = mongoose.Types.ObjectId;
import { Service } from '../utils/service.abstract';
import { IExample } from './example.document';
import { CustomError, CustomErrorCode } from '../utils/custom-error';

export class ExampleService extends Service<IExample> {
    constructor(model: Model<IExample>) {
        super(model, 'example');
    }

    public static get(): ExampleService {
        return super.getService(ExampleSchema, 'example', 'examples', ExampleService);
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

    async update(id: ObjectId, data: any) {
        const example = await this._model.findById(id);
        if (!example) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Example not found');
        }
        example.set(data);

        return await example.save();
    }

    async delete(id: ObjectId) {
        return await this._model.deleteOne({ _id: id });
    }
}
