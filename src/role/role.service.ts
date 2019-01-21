import { RoleModel } from './role.model';
import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;

export class RoleService {
    private static instance: RoleService;

    constructor() {
    }

    public static get(): RoleService {
        if (!this.instance) {
            this.instance = new RoleService();
        }
        return this.instance;
    }

    async getAll(criteria: any) {
        return await RoleModel.find(criteria || {});
    }

    async get(id: ObjectId, criteria: any) {
        criteria._id = id;
        return await RoleModel.findOne(criteria || {});
    }

    async create(roleData: any) {
        const role = new RoleModel(roleData);
        return await role.save();
    }

    async update(id: ObjectId, roleData: any){
        return await RoleModel.updateOne({_id:id},roleData);
    }

    async delete(id: ObjectId){
        return await RoleModel.deleteOne({_id:id});
    }

}
