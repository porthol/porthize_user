import { Service } from './service.abstract';
import { Document } from 'mongoose';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { PrivilegeService } from '../privilege/privilege.service';

export class ServiceManager<T extends Service<Document>> {
    private readonly serviceByName: {
            [name: string]: T;
        };

    constructor() {
        this.serviceByName = {};
    }

    registerService(service: T) {
        this.serviceByName[service.name()] = service;
    }

    getService(name: string): T {
        return this.serviceByName[name];
    }

    initService() {
        // register your service here
        UserService.get();
        RoleService.get();
        PrivilegeService.get();
    }
}

export const serviceManager = new ServiceManager();
