import { UserModel } from './user.model';
import { hashPassword } from '../utils/hashPassword';
import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;

export class UserService {
    private static instance: UserService;

    constructor() {
    }

    public static get(): UserService {
        if (!this.instance) {
            this.instance = new UserService();
        }
        return this.instance;
    }

    async getAll(criteria: any) {
        return await UserModel.find(criteria || {}).exec();
    }

    async get(id: ObjectId, criteria: any) {
        return await UserModel.findOne(criteria || {}).exec();
    }

    async create(userData: any) {
        userData.password = await hashPassword(userData.password);
        const user = new UserModel(userData);
        return await user.save();
    }

}
