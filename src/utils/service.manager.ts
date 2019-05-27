import { Service } from './service.abstract';
import { ExampleService } from '../example/example.service';
import { Document } from 'mongoose';

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
        ExampleService.get();
    }
}

export const serviceManager = new ServiceManager();
