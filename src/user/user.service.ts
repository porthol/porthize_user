import { UserModel } from './user.model';
import { hashPassword } from '../utils/hashPassword';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { RoleModel } from '../role';
import { comparePassword } from '../utils/comparePassword';
import * as jwt from 'jsonwebtoken';
import { getConfiguration } from '../utils/configuration.helper';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from '../utils/logger';
import { IUser } from './user.document';
import { IRoute } from '../privilege';
import { RoleService } from '../role/role.service';
import { Service } from '../utils/service.interface';
import ObjectId = mongoose.Types.ObjectId;

const config = getConfiguration().user;
configureLogger('UserService', defaultWinstonLoggerOptions);

interface LoginRequest {
    username?: string;
    email?: string;
    password: string;
}

export class UserService implements Service {
    private static instance: UserService;
    private readonly name: string;
    private readonly model = UserModel;

    constructor() {
        this.name = 'user';
    }

    getName(): string {
        return this.name;
    }

    getModel(): Model<any> {
        return this.model;
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

    async get(id: ObjectId, criteria = {} as any) {
        criteria._id = id;
        const user = await UserModel.findOne(criteria || {});
        return user ? this.getCleanUser(user) : null; // don't clean null object
    }

    async create(userData: any) {
        userData.password = await hashPassword(userData.password);
        const user = new UserModel(userData);
        return this.getCleanUser(await user.save());
    }

    async update(id: ObjectId, userData: any) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        user.set(userData);

        return this.getCleanUser(await user.save());
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

        if (index >= 0) {
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
        if (!config.jwt) {
            throw new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal server error : no token config');
        }

        let criteria: any = {};
        if (loginRequest.email) {
            criteria = { email: loginRequest.email };
        } else if (loginRequest.username) {
            criteria = { username: loginRequest.username };
        } else {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'Bad request', null);
        }

        const user = await UserModel.findOne(criteria);

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'No match for user and password');
        }

        if (comparePassword(loginRequest.password, user.password)) {
            const iat = Math.floor(Date.now() / 1000);
            const payload: any = {
                userId: user._id,
                iat
            };

            const token = await jwt.sign(payload, config.jwt.secret, config.jwt.options);
            getLogger('UserService').log('info', 'User %s connected at %d', user._id.toString(), iat);
            return { token, iat };
        }
        return null;
    }

    async getCurrentUser(tokenFromHeader: string) {
        if (!config.jwt) {
            throw new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal server error : no token config');
        }
        const now = Math.floor(Date.now() / 1000);

        const decodedPayload: any = await this.isTokenValid(tokenFromHeader);

        if (now >= decodedPayload.exp) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Token expired');
        }

        const user = await UserModel.findById(decodedPayload.userId);

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        return this.getCleanUser(user);
    }

    async isTokenValid(tokenFromHeader: string) {
        if (!config.jwt) {
            throw new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal server error : no token config');
        }
        if (!tokenFromHeader) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'There is no token present');
        }
        const token = getCleanToken(tokenFromHeader);

        const result = await jwt.verify(token, config.jwt.secret, config.jwt.options);

        return result;
    }

    async isAuthorized(partialUser: IUser, route: IRoute) {
        let result = false;
        try {
            const user = await UserModel.findById(partialUser._id);
            for (const roleId of user.roles) {
                result = await RoleService.get().isAuthorized(roleId, route);
                if (result === true) {
                    break;
                }
            }
        } catch (err) {
            getLogger('UserService').log('error', err.message);
        }
        return result;
    }

    private getCleanUser(user: IUser) {
        const cleanedUser = JSON.parse(JSON.stringify(user));

        delete cleanedUser.password;
        delete cleanedUser.roles;
        delete cleanedUser.emailing;
        delete cleanedUser.__v;

        return cleanedUser;
    }
}

function getCleanToken(tokenFromHeader: string) {
    return tokenFromHeader.substr(7);
}
