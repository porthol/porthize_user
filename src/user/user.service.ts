import { UserModel } from './user.model';
import { hashPassword } from '../utils/hashPassword';
import * as mongoose from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/CustomError';
import { RoleModel } from '../role';
import ObjectId = mongoose.Types.ObjectId;
import * as _ from 'lodash';
import { comparePassword } from '../utils/comparePassword';

interface LoginRequest {
    username?: string;
    email?: string;
    password: string;
}

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
        criteria._id = id;
        return await UserModel.findOne(criteria || {});
    }

    async create(userData: any) {
        userData.password = await hashPassword(userData.password);
        const user = new UserModel(userData);
        return await user.save();
    }

    async update(id: ObjectId, userData: any) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        user.set(userData);

        return await user.save();
    }

    async remove(id: ObjectId) {
        return await UserModel.deleteOne({ _id: id });
    }

    async addRole(userId: string, roleId: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        const role = await RoleModel.findById(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        const index = user.roles.indexOf(new ObjectId(roleId));

        if(index >= 0){
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'Role already added');
        }

        (user.roles || []).push(new ObjectId(roleId));

        return await user.save();
    }

    async removeRole(userId: string, roleId: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        const role = await RoleModel.findById(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        const index = user.roles.indexOf(new ObjectId(roleId));

        if (index || index === -1) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'This user does not have this role');
        }
        user.roles.splice(index, 1);
        return await user.save();
    }

    async login(loginRequest: LoginRequest) {
        let criteria: any = {};
        if(loginRequest.email) {
            criteria = {email : loginRequest.email};
        }else if(loginRequest.username){
            criteria = {username : loginRequest.username};
        }else {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'BAD REQUEST', null);
        }

        // criteria.password = await hashPassword(loginRequest.password);
        const user = await UserModel.findOne(criteria).exec();
        if(comparePassword(loginRequest.password,'toto')){
            return user;
        }
        return null;
    }

}
