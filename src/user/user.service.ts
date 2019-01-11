import { UserModel } from './user.model';
import { hashPassword } from '../utils/hashPassword';
import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;
import { CustomError, CustomErrorCode } from '../utils/CustomError';
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
