import * as mongoose from 'mongoose';
import { ExampleModel } from './example.model';
import ObjectId = mongoose.Types.ObjectId;

export class ExampleService {
    private static instance: ExampleService;

    constructor() {
    }

    public static get(): ExampleService {
        if (!this.instance) {
            this.instance = new ExampleService();
        }
        return this.instance;
    }

    async getAll(criteria: any) {
        return await ExampleModel.find(criteria || {});
    }

    async get(id: ObjectId, criteria: any) {
        criteria._id = new ObjectId(id);
        return await ExampleModel.findOne(criteria || {});
    }

    async create(data: any) {
        const example = new ExampleModel(data);
        return await example.save();
    }

    async update(id: ObjectId, userData: any) {
        return await ExampleModel.updateOne({ _id: id }, userData);
    }

    async delete(id: ObjectId) {
        return await ExampleModel.deleteOne({ _id: id });
    }

}
