import { CustomError, CustomErrorCode } from './custom-error';
import { Service } from './service.interface';

export class ServiceManager {
    private serviceByName: { [attr: string]: Service };

    constructor() {
        this.serviceByName = {};
    }


    registerService(service: Service) {
        this.serviceByName[service.getName()] = service;
    }

    getService(name: string): Service {
        const service = this.serviceByName[name];
        if (!service) {
            throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Service not found');
        }
        return service;
    }
}

export const serviceManager = new ServiceManager();
