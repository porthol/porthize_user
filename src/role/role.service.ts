import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from '../utils/logger';
import * as _ from 'lodash';
import { PrivilegeService } from '../privilege/privilege.service';
import { IPrivilegeEmbedded, IRouteEmbedded } from '../privilege/privilege.document';
import { Service } from '../utils/service.abstract';
import { IRole } from './role.document';
import { RoleSchema } from './role.model';
import ObjectId = mongoose.Types.ObjectId;
import { getConfiguration } from '../utils/configuration.helper';

const config: any = getConfiguration().user;
configureLogger('roleService', defaultWinstonLoggerOptions);

export interface IPrivilegeRoleAdd {
    privilegeId: string;
    actions: string[];
}

export interface IPrivilegeToImport {
    roleKey: string;
    resources: {
        resourceKey: string;
        actions: string[];
    }[];
}

export class RoleService extends Service<IRole> {
    constructor(model: Model<IRole>) {
        super(model, 'role');
    }

    public static get(): RoleService {
        return super.getService(RoleSchema, 'role', 'roles', RoleService);
    }

    /**
     * Get Role
     * @return Promise<IRole[]>
     * @param criteria
     * @param skip
     * @param limit
     */
    async getAll(criteria: any = {}, skip = 0, limit = config.paging.defaultValue) {
        return await this._model
            .find(criteria)
            .skip(skip)
            .limit(limit);
    }

    async getOne(criteria: any) {
        return await this._model.findOne(criteria || {});
    }

    async get(id: ObjectId, criteria = {} as any) {
        criteria._id = id;
        return await this._model.findOne(criteria);
    }

    async create(roleData: any) {
        const role = new this._model(roleData);
        return await role.save();
    }

    async update(id: ObjectId, roleData: any) {
        const role = await this._model.findById(id);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        role.set(roleData);

        return await role.save();
    }

    async delete(id: ObjectId) {
        return await this._model.deleteOne({ _id: id });
    }

    async addPrivilege(roleId: string, privilege: IPrivilegeRoleAdd) {
        const role = await this._model.findById(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        const privilegeFromDb = await PrivilegeService.get()
            .model()
            .findById(privilege.privilegeId);
        if (!privilegeFromDb) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
        }

        const index = role.privileges.map(p => p.resource.toString()).indexOf(privilegeFromDb.resource);

        if (index >= 0) {
            const privilegeStored = role.privileges[index];
            privilegeStored.actions = _.union(privilegeStored.actions, privilege.actions);
        } else {
            (role.privileges || []).push({
                resource: privilegeFromDb.resource,
                actions: privilege.actions
            } as IPrivilegeEmbedded);
        }

        role.markModified('privileges');

        return await role.save();
    }

    async removePrivilege(roleId: string, privilegeId: string) {
        const role = await this._model.findById(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }

        const index = role.privileges.map(p => p._id.toString()).indexOf(privilegeId);

        if (index || index === -1) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'This role does not have this privilege');
        }
        role.privileges.splice(index, 1);
        return await role.save();
    }

    // todo IRouteEmbedded is ambiguous
    async isAuthorized(roleId: ObjectId, route: IRouteEmbedded) {
        let result = false;
        const role = await this.get(roleId);
        if (!role) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
        }
        for (const privilege of role.privileges) {
            if (privilege.resource === '*') {
                result = true;
                break;
            }
            result = await PrivilegeService.get().isAuthorized(privilege, route);

            if (result === true) {
                break;
            }
        }
        return result;
    }

    async importPrivilege(privilegeToImports: IPrivilegeToImport[]) {
        for (const privilegeToImport of privilegeToImports) {
            const role = await this._model.findOne({
                key: privilegeToImport.roleKey
            });
            if (!role) {
                getLogger('roleService').log(
                    'warn',
                    JSON.stringify(new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found'))
                );
                continue;
            }
            for (const resource of privilegeToImport.resources) {
                const privilege = await PrivilegeService.get()
                    .model()
                    .findOne({
                        resource: resource.resourceKey
                    });
                if (!privilege) {
                    getLogger('roleService').log(
                        'warn',
                        JSON.stringify(new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found'))
                    );
                    continue;
                }
                try {
                    await this.addPrivilege(role.id, {
                        privilegeId: privilege.id,
                        actions: resource.actions
                    });
                } catch (e) {
                    getLogger('roleService').log('warn', e.message, e);
                }
            }
        }
    }
}
