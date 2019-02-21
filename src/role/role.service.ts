import { RoleModel } from './role.model';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { Service } from '../utils/service.interface';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from '../utils/logger';
import * as _ from 'lodash';
import { PrivilegeModel } from '../privilege/privilege.model';
import { PrivilegeService } from '../privilege/privilege.service';
import { IPrivilegeEmbedded, IRouteEmbedded } from '../privilege/privilege.document';
import ObjectId = mongoose.Types.ObjectId;

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

export class RoleService implements Service {
    private static instance: RoleService;
    model = RoleModel;
    private readonly name: string;

    constructor() {
        this.name = 'role';
    }

    getName(): string {
        return this.name;
    }

    getModel(): Model<any> {
        return this.model;
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

    async getOne(criteria: any) {
        return await RoleModel.findOne(criteria || {});
    }

    async get(id: ObjectId, criteria = {} as any) {
        criteria._id = id;
        return await RoleModel.findOne(criteria);
    }

    async create(roleData: any) {
        const role = new RoleModel(roleData);
        return await role.save();
    }

    async update(id: ObjectId, roleData: any) {
        const role = await RoleModel.findById(id);
        if (!role) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Role not found'
            );
        }

        role.set(roleData);

        return await role.save();
    }

    async delete(id: ObjectId) {
        return await RoleModel.deleteOne({ _id: id });
    }

    async addPrivilege(roleId: string, privilege: IPrivilegeRoleAdd) {
        const role = await RoleModel.findById(roleId);
        if (!role) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Role not found'
            );
        }

        const privilegeFromDb = await PrivilegeModel.findById(
            privilege.privilegeId
        );
        if (!privilegeFromDb) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Privilege not found'
            );
        }

        const index = role.privileges
            .map(p => p.resource.toString())
            .indexOf(privilegeFromDb.resource);

        if (index >= 0) {
            const privilegeStored = role.privileges[index];
            privilegeStored.actions = _.union(
                privilegeStored.actions,
                privilege.actions
            );
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
        const role = await RoleModel.findById(roleId);
        if (!role) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Role not found'
            );
        }

        const index = role.privileges
            .map(p => p._id.toString())
            .indexOf(privilegeId);

        if (index || index === -1) {
            throw new CustomError(
                CustomErrorCode.ERRBADREQUEST,
                'This role does not have this privilege'
            );
        }
        role.privileges.splice(index, 1);
        return await role.save();
    }

    // todo IRouteEmbedded is ambiguous
    async isAuthorized(roleId: ObjectId, route: IRouteEmbedded) {
        let result = false;
        const role = await this.get(roleId);
        if (!role) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Role not found'
            );
        }
        for (const privilege of role.privileges) {
            if (privilege.resource === '*') {
                result = true;
                break;
            }
            result = await PrivilegeService.get().isAuthorized(
                privilege,
                route
            );

            if (result === true) {
                break;
            }
        }
        return result;
    }

    async importPrivilege(privilegeToImports: IPrivilegeToImport[]) {
        for (const privilegeToImport of privilegeToImports) {
            const role = await RoleModel.findOne({
                key: privilegeToImport.roleKey
            });
            if (!role) {
                getLogger('roleService').log(
                    'warn',
                    JSON.stringify(
                        new CustomError(
                            CustomErrorCode.ERRNOTFOUND,
                            'Role not found'
                        )
                    )
                );
                continue;
            }
            for (const resource of privilegeToImport.resources) {
                const privilege = await PrivilegeModel.findOne({
                    resource: resource.resourceKey
                });
                if (!privilege) {
                    getLogger('roleService').log(
                        'warn',
                        JSON.stringify(
                            new CustomError(
                                CustomErrorCode.ERRNOTFOUND,
                                'Privilege not found'
                            )
                        )
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
