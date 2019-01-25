import { PrivilegeModel } from './privilege.model';
import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;
import { CustomError, CustomErrorCode } from '../utils/CustomError';

export class PrivilegeService {
    private static instance: PrivilegeService;

    constructor() {
    }

    public static get(): PrivilegeService {
        if (!this.instance) {
            this.instance = new PrivilegeService();
        }
        return this.instance;
    }

    async getAll(criteria: any) {
        return await PrivilegeModel.find(criteria || {});
    }

    async get(id: ObjectId, criteria: any) {
        criteria._id = id;
        return await PrivilegeModel.findOne(criteria || {});
    }

    async create(privilegeData: any) {
        const privilege = new PrivilegeModel(privilegeData);
        return await privilege.save();
    }

    async update(id: ObjectId, privilegeData: any){
        const privilege = await PrivilegeModel.findById(id);
        if (!privilege) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
        }

        privilege.set(privilegeData);

        return await privilege.save();
    }

    async delete(id: ObjectId){
        return await PrivilegeModel.deleteOne({_id:id});
    }

}
