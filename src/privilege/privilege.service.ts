import { PrivilegeModel } from './privilege.model';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { IRouteEmbedded } from './privilege.document';
import * as _ from 'lodash';
import { Service } from '../utils/service.interface';
import ObjectId = mongoose.Types.ObjectId;

export class PrivilegeService implements Service {
    private static instance: PrivilegeService;
    model = PrivilegeModel;
    private readonly name: string;

    constructor() {
        this.name = 'privilege';
    }

    getName(): string {
        return this.name;
    }

    getModel(): Model<any> {
        return this.model;
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

    async get(id: ObjectId, criteria = {} as any) {
        criteria._id = id;
        return await PrivilegeModel.findOne(criteria);
    }

    async create(privilegeData: any) {
        const privilege = new PrivilegeModel(privilegeData);
        return await privilege.save();
    }

    async update(id: ObjectId, privilegeData: any) {
        const privilege = await PrivilegeModel.findById(id);
        if (!privilege) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Privilege not found'
            );
        }

        privilege.set(privilegeData);

        return await privilege.save();
    }

    async delete(id: ObjectId) {
        return await PrivilegeModel.deleteOne({ _id: id });
    }

    async addRoutes(
        resource: string,
        action: string,
        routes: IRouteEmbedded[]
    ) {
        let privilege = await PrivilegeModel.findOne({ resource });
        if (!privilege) {
            // if the resource doesn't exist create it
            privilege = await this.create({ resource });
        }
        const actions = _.assign({}, privilege.actionsAvailable);

        if (!actions[action]) {
            actions[action] = [];
        }

        for (const route of routes) {
            route.url = this.removeQueryParams(route.url);
            if (actions[action].map(a => a.url).indexOf(route.url) === -1) {
                route.regexp = new RegExp(route.regexp);
                actions[action].push(route);
            }
        }

        privilege.set({ actionsAvailable: actions });
        privilege.markModified('actionsAvailable');

        return await privilege.save();
    }

    async isAuthorized(privilege: any, route: IRouteEmbedded) {
        const privilegeFromDb = await PrivilegeModel.findOne({
            resource: privilege.resource
        });
        if (!privilegeFromDb) {
            throw new CustomError(
                CustomErrorCode.ERRNOTFOUND,
                'Privilege not found'
            );
        }

        for (const action in privilegeFromDb.actionsAvailable) {
            if (privilege.actions.indexOf(action) === -1) {
                // you do not have this action available
                continue;
            }
            for (const dbRoute of privilegeFromDb.actionsAvailable[action]) {
                route.url = this.removeQueryParams(route.url);
                if (
                    dbRoute.regexp.test(route.url) &&
                    dbRoute.method.toLowerCase() === route.method.toLowerCase()
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private removeQueryParams(url: string) {
        if (url.indexOf('?') > 0) {
            url = url.substr(0, url.indexOf('?'));
        }
        return url;
    }
}
