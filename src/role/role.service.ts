import { RoleModel } from './role.model';
import * as mongoose from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/CustomError';
import { PrivilegeModel } from '../privilege';
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

    async update(id: ObjectId, roleData: any) {
        const role = await RoleModel.findById(id);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        role.set(roleData);

        return await role.save();
    }

    async delete(id: ObjectId) {
        return await RoleModel.deleteOne({ _id: id });
    }


    async addPrivilege(roleId: string, privilegeId: string) {
        const role = await RoleModel.findById(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        const privilege = await PrivilegeModel.findById(privilegeId);
        if (!privilege) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
        }

        const index = role.privileges.map(p => p._id.toString()).indexOf(privilegeId);

        if (index >= 0) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'Privilege already added');
        }

        (role.privileges || []).push(privilege);

        return await role.save();
    }

    async removePrivilege(roleId: string, privilegeId: string) {
        const role = await RoleModel.findById(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        const privilege = await PrivilegeModel.findById(privilegeId);
        if (!privilege) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
        }

        const index = role.privileges.map(p => p._id.toString()).indexOf(privilegeId);

        if (index || index === -1) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'This role does not have this privilege');
        }
        role.privileges.splice(index, 1);
        return await role.save();
    }

}
