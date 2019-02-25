import { hashPassword } from '../utils/hashPassword';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { comparePassword } from '../utils/comparePassword';
import * as jwt from 'jsonwebtoken';
import { getConfiguration } from '../utils/configuration.helper';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from '../utils/logger';
import { IUser } from './user.document';
import { RoleService } from '../role/role.service';
import { communicationHelper } from '../server';
import { IRouteEmbedded } from '../privilege/privilege.document';
import { Service } from '../utils/service.abstract';
import { UserSchema } from './user.model';
import ms = require('ms');
import ObjectId = mongoose.Types.ObjectId;

const config: any = getConfiguration().user;
configureLogger('UserService', defaultWinstonLoggerOptions);

interface ILoginRequest {
    username?: string;
    email?: string;
    password: string;
}

interface INotificationService {
    name: string;
    sendNotifRoute: string;
    resetLinkTemplate: string;
}

export class UserService extends Service<IUser> {
    constructor(ws: string, model: Model<IUser>) {
        super(ws, model, 'user');
    }

    public static get(ws: string): UserService {
        return super.getService(ws, UserSchema, 'user', 'users', UserService);
    }

    async getAll(criteria: any) {
        const users = await this._model.find(criteria || {});

        for (let i = 0; i < users.length; i++) {
            users[i] = this.getCleanUser(users[i]);
        }

        return users;
    }

    async get(id: ObjectId, criteria = {} as any) {
        // todo we will need to get role one time =/
        criteria._id = id;
        const user = await this._model.findOne(criteria || {});
        return user ? this.getCleanUser(user) : null; // don't clean null object
    }

    async create(userData: any, addDefaultRole = true) {
        userData.password = await hashPassword(userData.password);
        const user = new this._model(userData);
        await user.save();

        if (addDefaultRole) {
            const defaultRole = await RoleService.get(this._ws).getOne({
                key: config.defaultRoleKey
            });

            if (!defaultRole) {
                getLogger('UserService').log('warn', 'Default role has not been found. User created got no role !');
            }
            user.roles.push(defaultRole._id);
            user.markModified('roles');
            await user.save();
        }

        return this.getCleanUser(user);
    }

    async update(id: ObjectId, userData: any) {
        const user = await this._model.findById(id);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        user.set(userData);

        return this.getCleanUser(await user.save());
    }

    async remove(id: ObjectId) {
        return await this._model.deleteOne({ _id: id });
    }

    async addRole(userId: string, roleId: string): Promise<IUser> {
        const user = await this._model.findById(userId);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        const role = await RoleService.get(this._ws)
            .model()
            .findById(roleId);
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
        const user = await this._model.findById(userId);
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        const role = await RoleService.get(this._ws)
            .model()
            .findById(roleId);
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

    async login(loginRequest: ILoginRequest) {
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

        criteria.enabled = true;

        const user = await this._model.findOne(criteria);

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'No match for user and password');
        }

        if (!user.loginEnabled || !user.enabled) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized to log in');
        }

        if (comparePassword(loginRequest.password, user.password)) {
            const iat = Math.floor(Date.now() / 1000);
            const payload: any = {
                userId: user._id,
                iat
            };

            user.lastLogIn = new Date();
            await user.save();

            const token = await jwt.sign(payload, this.getJwtSecret(), config.jwt.options);
            getLogger('UserService').log('info', 'User %s connected at %d', user._id.toString(), iat);
            return { token, iat };
        }
        throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'No match for user and password');
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

        const user = await this._model.findOne({
            _id: decodedPayload.userId,
            enabled: true
        });

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        if (!user.enabled) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized');
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

        const result = await jwt.verify(token, this.getJwtSecret(), config.jwt.options);

        return result;
    }

    async isAuthorized(partialUser: IUser, route: IRouteEmbedded) {
        let result = false;

        const user = await this._model.findOne({
            _id: partialUser._id,
            enabled: true
        });

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        if (!user.enabled) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized');
        }
        for (const roleId of user.roles) {
            result = await RoleService.get(this._ws).isAuthorized(roleId, route);
            if (result === true) {
                break;
            }
        }
        return result;
    }

    async createBotUser(uuid: string) {
        const appUser = {
            username: uuid,
            email: uuid + '@micro-service.com',
            password: 'none',
            loginEnabled: false,
            emailing: false
        };

        let user = await this.create(appUser, false);

        const botRole = await RoleService.get(this._ws).getOne({
            key: config.roleBotKey
        });

        if (!botRole) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'The bot role does not exist on key ' + config.roleBotKey + '. Can not register the user'
            );
        }
        user = await this.addRole(user._id, botRole._id);
        const token = await this.generateBotToken((user as IUser)._id.toString());
        return token;
    }

    async getBotToken(token: string) {
        const payload: any = await this.isTokenValid(token);
        return await this.generateBotToken(payload.userId);
    }

    async resetPassword(email: string) {
        const user = await this._model.findOne({ email, enabled: true });
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }

        const token = this.getNewToken();

        const notifConfig: INotificationService = config.notificationService;

        await communicationHelper.post(
            notifConfig.sendNotifRoute,
            {
                workspace: this._ws
            },
            {
                type: 'resetPassword',
                format: 'email',
                data: {
                    subject: 'Reset Password',
                    username: user.username || user.email,
                    link: notifConfig.resetLinkTemplate.replace('{token}', token).replace('{email}', user.email)
                },
                users: [user._id]
            }
        );
    }

    private getNewToken() {
        const possibleLetters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let token = '';

        for (let i = 0; i < config.resetTokenLength; i++) {
            token += possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
        }

        return token;
    }

    private async generateBotToken(userId: string) {
        const user = await this._model.findOne({ _id: userId, enabled: true });
        if (!user) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
        }
        const roles = await RoleService.get(this._ws)
            .model()
            .find({ _id: { $in: user.roles } });
        if (roles.map(r => r.key).indexOf(config.roleBotKey) !== -1 && !user.loginEnabled) {
            const iat = Math.floor(Date.now() / 1000);
            const payload: any = {
                userId: user._id,
                iat
            };

            user.lastLogIn = new Date();
            await user.save();

            const token = await jwt.sign(payload, this.getJwtSecret(), config.jwt.botOptions);
            getLogger('UserService').log('info', 'Bot %s get his token %d', user.username, iat);
            return { token, renewTimeOut: ms(config.botTokenRenew) };
        }
        return null;
    }

    private getCleanUser(user: IUser): IUser {
        const cleanedUser = JSON.parse(JSON.stringify(user));

        delete cleanedUser.password;
        delete cleanedUser.roles;
        delete cleanedUser.emailing;
        delete cleanedUser.__v;

        return cleanedUser;
    }

    private getJwtSecret() {
        return this._ws + '-' + config.jwt.secret;
    }
}

function getCleanToken(tokenFromHeader: string) {
    return tokenFromHeader.substr(7);
}
