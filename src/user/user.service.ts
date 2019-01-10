import { UserModel } from './user.model';
import { hashPassword } from '../utils/hashPassword';

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

    async create(userData: any) {
        const user = new UserModel(userData);
        user.set({
            password: hashPassword(userData.password)
        });
        return await user.save();
    }

}
