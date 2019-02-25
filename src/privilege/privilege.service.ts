import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { IPrivilege, IRouteEmbedded } from './privilege.document';
import * as _ from 'lodash';
import { Service } from '../utils/service.abstract';
import { PrivilegeSchema } from './privilege.model';
import ObjectId = mongoose.Types.ObjectId;

export class PrivilegeService extends Service<IPrivilege> {
    constructor(ws: string, model: Model<IPrivilege>) {
        super(ws, model, 'privilege');
    }

    public static get(ws: string): PrivilegeService {
        return super.getService(ws, PrivilegeSchema, 'privilege', 'privileges', PrivilegeService);
    }

    async getAll(criteria: any) {
        return await this._model.find(criteria || {});
    }

    async get(id: ObjectId, criteria = {} as any) {
        criteria._id = id;
        return await this._model.findOne(criteria);
    }

    async create(privilegeData: any) {
        const privilege = new this._model(privilegeData);
        return await privilege.save();
    }

    async update(id: ObjectId, privilegeData: any) {
        const privilege = await this._model.findById(id);
        if (!privilege) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
        }

        privilege.set(privilegeData);

        return await privilege.save();
    }

    async delete(id: ObjectId) {
        return await this._model.deleteOne({ _id: id });
    }

    async addRoutes(resource: string, action: string, routes: IRouteEmbedded[]) {
        let privilege = await this._model.findOne({ resource });
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
        const privilegeFromDb = await this._model.findOne({
            resource: privilege.resource
        });
        if (!privilegeFromDb) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
        }

        for (const action in privilegeFromDb.actionsAvailable) {
            if (privilege.actions.indexOf(action) === -1) {
                // you do not have this action available
                continue;
            }
            for (const dbRoute of privilegeFromDb.actionsAvailable[action]) {
                route.url = this.removeQueryParams(route.url);
                if (dbRoute.regexp.test(route.url) && dbRoute.method.toLowerCase() === route.method.toLowerCase()) {
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
