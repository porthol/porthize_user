import { Service } from './service.abstract';
import { Document } from 'mongoose';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { PrivilegeService } from '../privilege/privilege.service';

export class ServiceManager<T extends Service<Document>> {
    private readonly serviceByName: {
        [workspace: string]: {
            [name: string]: T;
        };
    };

    constructor() {
        this.serviceByName = {};
    }

    registerService(workspace: string, service: T) {
        if (!this.serviceByName[workspace]) {
            this.initWS(workspace);
        }
        this.serviceByName[workspace][service.name()] = service;
    }

    getService(workspace: string, name: string): T {
        if (!this.serviceByName[workspace]) {
        }
        return this.serviceByName[workspace][name];
    }

    initWS(ws: string) {
        // register your service here
        this.serviceByName[ws] = {};
        UserService.get(ws);
        RoleService.get(ws);
        PrivilegeService.get(ws);
    }
}

export const serviceManager = new ServiceManager();
