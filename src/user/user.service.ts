import { UserModel } from './user.model';

export class UserService {
    private static instance:UserService;

    public static get(): UserService{
        if(!this.instance){
            this.instance = new UserService();
        }
        return this.instance;
    }

    async getAll(criteria: any) {
        //todo load role
        return await UserModel.find(criteria);
    }

}
