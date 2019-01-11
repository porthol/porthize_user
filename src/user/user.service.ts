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
        return await UserModel.find(criteria || {});
    }

    async get(id: ObjectId, criteria: any) {
        criteria._id = new ObjectId(id);
        return await UserModel.findOne(criteria || {});
    }

    async create(userData: any) {
        userData.password = await hashPassword(userData.password);
        const user = new UserModel(userData);
        return await user.save();
    }

    async update(id: ObjectId, userData: any){
        return await UserModel.updateOne({_id:id},userData);
    }

    async delete(id: ObjectId){
        return await UserModel.deleteOne({_id:id});
    }

}
